const User = require("./../models/user.model");

async function getMe(req, res) {
  // console.log("It hit GetMe function");
  try {
    const result = await User.findById(res.locals.userId);
    // console.log(result);
    res.json({ user: result });
  } catch (err) {
    console.log("Error : ", err);
    res.status(500).json();
  }
}

module.exports = { getMe };
