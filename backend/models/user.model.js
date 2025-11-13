require("dotenv").config({
  path: "./jwtSecret.env",
  quiet: true,
});
const jwt = require("jsonwebtoken");
const { resetPassword } = require("../controllers/auth.controller");
const bcryptjs = require("bcryptjs");
const { getDb } = require("./../data/database");

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

class User {
  constructor(userData) {
    this.email = userData.email;
    this.name = userData.name;
    this.password = userData.password;
  }
  register() {
    // console.log(this.email);
    // console.log(this.password);
    const password_hash = bcryptjs.hashSync(this.password, 12);
    return getDb().execute(
      "INSERT INTO Users(name,email,password_hash,roles) VALUES (?,?,?,?)",
      [this.name, this.email, password_hash, this.role]
    );
  }
  async login() {
    console.log(this.email, this.password);
    const userCredintials = await getDb().query(
      "SELECT user_id,password_hash FROM Users where email=?",
      this.email
    );
    console.log(
      "Statement : SELECT user_id,password_hash FROM Users where email=" +
        "'" +
        this.email +
        "';"
    );
    console.log(userCredintials);
    if (userCredintials.length === 0) {
      return { error: "Email not registered! Try Registering Instead!" };
    }

    const isAuthenticated = bcryptjs.compareSync(
      this.password,
      userCredintials[0].password_hash
    );

    if (!isAuthenticated) {
      return { error: "Invalid Credintials" };
    }

    return { user_id: userCredintials[0].user_id };
  }
  static async findUserByEmail(email) {
    try {
      const result = await getDb().query(
        `select email from Users where email='${email}' limit 1`
      );
      if (result) {
        return result[0];
      } else {
        return null;
      }
    } catch (err) {
      console.log("Failed fetching user data from database");
      console.log(err);
    }
  }
}

module.exports = User;
