const { func } = require("joi");
const User = require("../models/user.model");

function isAdmin(req, res, next) {
  const userId = req.locals.userId;
  if (!userId) {
    return res.status(403).json();
  }
  const admin = User.isAdmin(userId);
  if (!admin) {
    return res.status().json();
  }
  next();
}

module.exports = isAdmin;
