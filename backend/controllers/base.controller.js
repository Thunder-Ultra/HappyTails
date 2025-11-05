function getHome(req, res) {
  if (req.session.user) {
    res.render("home", { username: req.session.user.displayName });
  } else {
    res.render("home", { username: null });
  }
}

module.exports = { getHome };
