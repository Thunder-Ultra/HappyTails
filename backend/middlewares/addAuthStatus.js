require("dotenv").config({
  path: "./jwtSecret.env",
  quiet: true,
});
const jwt = require("jsonwebtoken");

function setAuthStatus(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  // console.log(authorizationHeader);
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    // console.log("Token :", token);
    try {
      const tokenData = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(tokenData);
      // console.log("Token expiry date:", new Date(tokenData.iat  ));
      // console.log("Token expiry date:", new Date(tokenData.exp));
      // console.log("Token Data :", tokenData);
      if (!tokenData.id) {
        return (res.locals.isAuth = false);
      }
      res.locals.isAuth = true;
      res.locals.userId = tokenData.id;
      // console.log("tokenData :", tokenData);
      // console.log();
      // console.log(tokenData);
      // console.log(res.locals);
    } catch (err) {
      // console.log("found error");
      res.locals.isAuth = false;
    }
  }
  next();
}

module.exports = setAuthStatus;
