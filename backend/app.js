const PORT_NO = 4000;

const express = require("express");
const session = require("express-session");
const db = require("./data/database");
const setupPassport = require("./config/passport");
const createSessionConfig = require("./config/session");
const publicRoutes = require("./routes/public.routes");
const authRoutes = require("./routes/auth.routes");
const baseRoutes = require("./routes/base.routes");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session(createSessionConfig()));
setupPassport(app);

app.use(publicRoutes);
app.use(authRoutes);
app.use(baseRoutes);

db.connectToDatabase()
  .then(() => {
    app.listen(PORT_NO, (err) => {
      if (!err) {
        console.log("Server Started on http://locallhost:" + PORT_NO);
      } else {
        console.log("Error Found");
        console.log(err);
      }
    });
  })
  .catch((err) => {
    console.log("Failed Connecting to Database");
    console.log(error);
  });
