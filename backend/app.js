const PORT_NO = 4000;

const express = require("express");

const app = express();
const baseRoutes = require("./routes/base.routes");
const authRoutes = require("./routes/auth.routes");

app.set("view engine", "ejs");

app.use(authRoutes);
app.use(baseRoutes);

app.listen(PORT_NO, (err) => {
  if (!err) {
    console.log("Server Started on http://locallhost:" + PORT_NO);
  } else {
    console.log("Error Found");
    console.log(err);
  }
});
