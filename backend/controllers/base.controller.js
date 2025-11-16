function getHome(req, res) {
  res.json({
    msg: "This was meant to be home, but it will be changed later, as it is going to be a api only server.",
  });
}

module.exports = { getHome };
