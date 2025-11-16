require("dotenv").config({
  path: "./jwtSecret.env",
  quiet: true,
});
const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  console.log("authorization Header :", authorizationHeader);
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    console.log("Token :", token);
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token expiry date:", new Date(tokenData.iat  ));
    console.log("Token expiry date:", new Date(tokenData.exp));
    res.locals.isAuth = true;
  }
  next();
}

module.exports = checkAuth;
