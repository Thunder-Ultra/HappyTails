const { getDb } = require("./../data/database");

class User {
  static async findUserByEmail(email) {
    try {
      const result = getDb().query(
        `select * from Users where email='${email}' limit 1`
      );
      return result;
    } catch (err) {
      console.log("Failed fetching user data from database");
      console.log(err);
    }
  }
}

module.exports = User;
