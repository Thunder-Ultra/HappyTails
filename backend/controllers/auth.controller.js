// const { AuthWeakPasswordError } = require("@supabase/supabase-js");
require("dotenv").config({
  path: "./googleClientCredintials.env",
  quiet: true,
});
require("dotenv").config({
  path: "./serverURI.env",
  quiet: true,
});
const User = require("./../models/user.model");
const newUserSchema = require("../validation/registrationDataValidation");
const loginDetailSchema = require("../validation/loginDataValidation");
const {
  generateToken,
  redirectGoogleCallbackError,
} = require("./../utils/auth");
const { OAuth2Client, OAuth2ClientOptions } = require("google-auth-library");
const otpCache = require("../utils/otpStore"); // Your Node-Cache instance
const { sendOtpEmail } = require("../utils/emailService");
const { hashData, verifyHash } = require("../utils/hashUtil"); // Import the new utils

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.BACKEND_HOSTING_URI + "/api/auth/google/callback"
);

async function register(req, res, next) {
  const registrationData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const { value: cleanRegistrationData, error } =
    newUserSchema.validate(registrationData);
  if (error) {
    return res.json({ msg: error.details[0].message });
  }

  const userAlreadyExists = await User.findUserByEmail(
    cleanRegistrationData.email
  );

  if (userAlreadyExists) {
    return res.json({
      msg: "Email already exists! Try login instead!",
    });
  }

  const newUser = new User(cleanRegistrationData);

  try {
    const response = await newUser.register();
    // console.log(response);
    return res.json({ success: true, msg: "Registration Successful" });
  } catch (err) {
    console.log("User Registration Failed");
    next(err);
    // console.log(err);
    // return res.json({ msg: "Registration Failed" });
  }
  // res.redirect("/login");
}

async function login(req, res, next) {
  // Get user credintials from the body
  const loginData = { email: req.body.email, password: req.body.password };
  // Check if the email and password is empty
  const { value: cleanLoginData, error } =
    loginDetailSchema.validate(loginData);
  if (error) {
    return res.json({ msg: error.details[0].message });
  }
  // console.log(cleanLoginData); // Working
  // Validate the credintials
  const user = new User({
    email: cleanLoginData.email,
    password: cleanLoginData.password,
  });
  // Redirect to Login Page if credintials are invalid
  try {
    const { userId, error } = await user.login();
    if (error) {
      return res.json({ msg: error });
    }
    const token = generateToken(userId);
    res.json({ success: true, token });
  } catch (err) {
    console.log("User Login Falied");
    next(err);
  }
}

function getAuthGoogle(req, res) {
  const redirectUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });

  // console.log(redirectUrl);
  res.redirect(redirectUrl);
}

async function getAuthGoogleCallback(req, res) {
  const code = req.query.code;

  if (!code) {
    return redirectGoogleCallbackError(
      "Failed Google Authorizaition! Try Again!"
    );
  }
  // return redirectGoogleCallbackError("Trial Error");
  try {
    // 2. Exchange code for tokens
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // 3. Check if user exists in your DB
    let existingUser = await User.findUserByEmail(payload.email);
    let isNewUser = false;

    // 4. Register user if they don't exist
    if (!existingUser) {
      try {
        const newUser = new User({
          name: payload.name,
          email: payload.email,
          // Add picture if your schema supports it
          // picture: paylogoogle-success?error=truead.picture
        });

        await newUser.register();

        // Fetch the newly created user to get the generated ID
        existingUser = await User.findUserByEmail(payload.email);
        isNewUser = true;
      } catch (dbError) {
        console.error("Registration Error:", dbError);
        const msg = encodeURIComponent(
          "Account creation failed. Please try again."
        );
        return redirectGoogleCallbackError(msg);
      }
    }

    // 5. Generate JWT Token (Ensure you use the user_id from your DB, not Google's sub)
    // console.log("existingUser :", existingUser);
    const token = generateToken(existingUser.id);

    // 6. Construct Success URL
    // Note: using '&' to separate parameters, not '%'
    let redirectPath = `${
      process.env.FRONTEND_HOSTING_URI
    }/google-success?token=${encodeURIComponent(token)}`;

    if (isNewUser) {
      redirectPath += "&new=true";
    }

    // 7. Final Redirect to Frontend
    return res.redirect(redirectPath);
  } catch (err) {
    console.error("Google Auth Error:", err);
    // Generic error handler for token verification failures or other server errors
    const msg = encodeURIComponent(
      "Authentication failed. Please try again later."
    );
    return redirectGoogleCallbackError(msg);
  }
}

// 1. Forgot Password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, we sent an OTP." });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP using helper function
    const hashedOtp = await hashData(otp);

    // Store in memory (expires in 10 mins)
    otpCache.set(email, hashedOtp);

    // Send plain OTP via email
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Error sending OTP" });
  }
}

// 2. Verify OTP
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const cachedHashedOtp = otpCache.get(email);

    // console.log("DEBUG VALUES");
    // console.log("email :", email);
    // console.log("otp :", otp);
    // console.log("cachedHashedOtp :", cachedHashedOtp);

    if (!cachedHashedOtp) {
      return res
        .status(400)
        .json({ message: "OTP has expired or is invalid." });
    }

    // Verify OTP using helper function
    const isMatch = await verifyHash(otp, cachedHashedOtp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ message: "OTP Verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
}

// 3. Reset Password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    // Re-verify OTP to prevent direct API calls skipping step 2
    const cachedHashedOtp = otpCache.get(email);

    if (!cachedHashedOtp) {
      return res
        .status(400)
        .json({ message: "Session expired. Please request a new OTP." });
    }

    const isMatch = await verifyHash(otp, cachedHashedOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update User Password in DB
    const existingUser = await User.findUserByEmail(email);
    existingUser.password = newPassword;
    await existingUser.updatePassword();

    // Clear the OTP from memory
    otpCache.del(email);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Error resetting password" });
  }
}

// function forgotPassword(req, res) {
//   console.log("OTP Request Recieved");
//   console.log(req.body);
//   return res.status(500).json();
// }

// function verifyOtp(req, res) {
//   res.render("auth/verifyOtp");
// }

// function resetPassword(req, res) {
//   res.redirect("/login");
//   const newPassword = req.body;
// }

module.exports = {
  // getLogin,
  login,
  getAuthGoogle,
  getAuthGoogleCallback,
  // logout,
  // getRegister,
  register,
  // getForgotPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
