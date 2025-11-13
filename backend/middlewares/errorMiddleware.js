function notFound(_req, res, _next) {
  res.status(404).json({ msg: "Not Found" });
}

function errorHandler(err, req, res, next) {
  console.log(err);
  res.status(500).json({
    msg: "Server Error! Pls try again later",
  });
}

// function errorHandler(err, _req, res, _next) {
//   const statusCode =
//     err && (err.status || err.statusCode) ? err.status || err.statusCode : 500;
//   res.status(statusCode).json({
//     msg: err && err.message ? err.message : "Server Error! Pls try again later",
//     ...(process.env.NODE_ENV !== "production" && err
//       ? { stack: err.stack }
//       : {}),
//   });
// }

module.exports = { notFound, errorHandler };
