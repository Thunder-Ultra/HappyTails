const bcryptjs = require("bcryptjs");
const { getDb } = require("./../data/database");

class User {
  constructor(userData) {
    this.id = userData.user_id;
    this.email = userData.email;
    this.name = userData.name;
    this.password = userData.password;
  }
  register() {
    const password_hash = this.password
      ? bcryptjs.hashSync(this.password, 12)
      : "";
    return getDb().execute(
      "INSERT INTO Users(name,email,password_hash) VALUES (?,?,?)",
      [this.name, this.email, password_hash]
    );
  }
  async login() {
    const userCredintials = await getDb().query(
      "SELECT user_id,password_hash FROM Users where email=?",
      this.email
    );

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

    return { userId: userCredintials[0].user_id };
  }
  static async findUserByEmail(email) {
    try {
      const result = await getDb().query(
        `select user_id, email from Users where email='${email}' limit 1`
      );
      if (result) {
        return new User(result[0]);
      } else {
        return null;
      }
    } catch (err) {
      console.log("Failed fetching user data from database");
      console.log(err);
    }
  }
  static async findById(userId) {
    if (!userId) {
      return;
    }
    // console.log("userId :", userId);
    const result = await getDb().query(
      "SELECT email, name from Users Where user_id=?",
      userId
    );
    if (result.length) {
      return result[0];
    }
  }
  async isAdmin(userId) {
    try {
      const result = getDb().query(
        "SELECT is_admin FROM Users where user_id=?",
        userId
      );
      if (result.length == 0) {
        return false;
      }
      return result[0]["is_admin"];
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async updateDetails() {
    const query = "UPDATE Users SET name=? WHERE user_id=?";

    let params = [];
    if (this.name) {
      params.push(this.name);
    }
    if (this.email) {
      params.push(this.name);
    }
    if (this.password) {
      params.push(this.name);
    }
    params.push(this.id);

    // console.log(query);
    // console.log(params);
    const result = await getDb().execute(query, params);
    return result;
  }
  async updatePassword() {
    const password_hash = this.password
      ? bcryptjs.hashSync(this.password, 12)
      : "";
    return getDb().execute("UPDATE Users SET password_hash=? WHERE user_id=?", [
      password_hash,
      this.id,
    ]);
  }
}

module.exports = User;
