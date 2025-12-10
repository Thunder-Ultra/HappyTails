function checkAuth(req, res, next) {
  // console.log("res.locals.isAuth :", res.locals.isAuth);
  if (!res.locals.isAuth) {
    console.log("Unauthorized User");
    return res.status(401).json();
  }
  next();
}

module.exports = checkAuth;
