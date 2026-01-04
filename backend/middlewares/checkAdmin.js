const User = require("../models/user.model");

async function isAdmin(req, res, next) {
  // Fix: Access res.locals (where addAuthStatus stores it)
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(403).json({ msg: "Access Denied: No User ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.is_admin !== "Yes") {
      return res
        .status(403)
        .json({ msg: "Access Denied: Admin privileges required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = isAdmin;
