function getLogin(req, res) {
  res.render("login");
}
function getRegister(req, res) {
  res.render("register");
}

module.exports = { getLogin, getRegister };
