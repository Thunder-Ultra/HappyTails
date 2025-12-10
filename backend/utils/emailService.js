require("dotenv").config({
  path: "./googleClientCredintials.env",
  quiet: true,
});

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // This must match the URI used to get the token
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    // Get a new Access Token on the fly
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error("Failed to generate access token:", err);
          reject("Failed to generate access token");
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    throw error;
  }
};

const sendOtpEmail = async (toEmail, otpCode) => {
  try {
    const transporter = await createTransporter();
    // console.log(process.env);

    const mailOptions = {
      from: `"Happy Tails" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #6d28d9; letter-spacing: 5px;">${otpCode}</h1>
          <p>Valid for 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully");
  } catch (error) {
    console.error("Email Service Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendOtpEmail };
