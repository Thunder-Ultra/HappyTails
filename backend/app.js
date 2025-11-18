const PORT_NO = 4000;

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const db = require("./data/database");
// const setupPassport = require("./config/passport");
const createSessionConfig = require("./config/session");
const setAuthStatusMiddleware = require("./middlewares/addAuthStatus");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adoptableRoutes = require("./routes/adoptable.routes");
const petRoutes = require("./routes/pet.routes");
const adminRoutes = require("./routes/admin.routes");
const checkAuthMiddleware = require("./middlewares/checkAuthMiddleware");
const checkAdminMiddleware = require("./middlewares/checkAdmin");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json()); // For handing JSON requests
app.use(express.urlencoded({ extended: false })); // For handling Forms

app.use(session(createSessionConfig()));
app.use(setAuthStatusMiddleware);
// setupPassport(app);

app.use("/api/auth", authRoutes);
app.use("/api/users", checkAuthMiddleware, userRoutes);
app.use("/api/adoptables", checkAuthMiddleware, adoptableRoutes);
app.use("/api/pets", checkAuthMiddleware, petRoutes);
app.use("/api/admin", checkAuthMiddleware, checkAdminMiddleware, adminRoutes);

app.use(notFound);
app.use(errorHandler);

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
