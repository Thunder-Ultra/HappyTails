const User = require("./../models/user.model");

/**
 * GET /api/users/me
 * Returns full profile including Address and UserProfile details
 */
async function getMe(req, res, next) {
  try {
    const userId = res.locals.userId;
    // console.log(userId);
    const result = await User.findById(userId);
    // console.log(result);

    if (!result) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Return the full joined object
    return res.json({
      success: true,
      user: result,
    });
  } catch (err) {
    console.error("Error in getMe:", err);
    next(err);
  }
}

/**
 * PATCH /api/users/me
 * Updates core info, adoption profile, and address
 */
async function setMe(req, res, next) {
  try {
    const userId = res.locals.userId;

    // 1. Fetch current user data first
    // This ensures we have the correct 'address_id' for the update logic in the model
    const currentData = await User.findById(userId);
    if (!currentData) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 2. Initialize the model with current data
    const userInstance = new User(currentData);

    // 3. Extract data from React frontend request body
    // Expected JSON structure from React:
    // {
    //    "name": "John Doe",
    //    "profile": { "occupation": "Software Engineer", "housing_type": "Apartment", ... },
    //    "address": { "street": "Main St", "town_city": "Mumbai", ... }
    // }
    const { name, profile, address } = req.body;

    // 4. Call the Master Update method (fixes your 'updateDetails' error)
    await userInstance.updateDetails({ name }, profile, address);

    // 5. Fetch updated data to send back to frontend
    const updatedUser = await User.findById(userId);

    return res.json({
      success: true,
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in setMe:", err);
    // If the error is a database constraint error, you can customize the message here
    res.status(500).json({ msg: "Failed to update all profile details" });
  }
}

module.exports = { getMe, setMe };
