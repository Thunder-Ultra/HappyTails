function getIntro(req, res) {
  res.render("intro");
}

function getContact(req, res) {
  res.render("about");
}

function getFeatures(req, res) {
  res.render("features");
}

module.exports = { getIntro, getContact, getFeatures };
