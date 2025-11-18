const User = require("./../models/user.model");

async function getMe(req, res) {
  // console.log("It hit GetMe function");
  try {
    const result = await User.findById(res.locals.userId);
    // console.log(result);
    return res.json({ user: result });
  } catch (err) {
    console.log("Error : ", err);
    res.status(500).json();
  }
}

async function setMe(req, res) {
  const data = req.body;

  // console.log(data);
  const existingUser = new User({ id: res.locals.userId, name: data.name });

  try {
    await existingUser.updateDetails();
    return res.json({ user: { name: data.name } });
  } catch (err) {
    console.log(err);
    return res.status(500).json();
  }
}

module.exports = { getMe, setMe };
