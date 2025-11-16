function notFound(_req, res, _next) {
  res.status(404).json({ msg: "Not Found" });
}

function errorHandler(err, req, res, next) {
  console.log(err);
  res.status(500).json({
    msg: "Server Error! Pls try again later",
  });
}

module.exports = { notFound, errorHandler };
