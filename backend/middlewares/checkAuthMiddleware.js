function checkAuth(req, res, next) {
  if (!res.locals.isAuth) {
    console.log("Unauthorized User");
    return res.status(401).json();
  }
  next();
}

module.exports = checkAuth;
