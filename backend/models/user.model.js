const bcryptjs = require("bcryptjs");
const { getDb } = require("./../data/database");

class User {
  constructor(userData) {
    // Database column is 'id', not 'user_id'
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password; // Raw password (only present during register/login)
    this.is_admin = userData.is_admin || "No"; // Default to Schema ENUM default
    this.address_id = userData.address_id || null;
    this.profile_pic_name = userData.profile_pic_name || null;
  }

  async register() {
    const password_hash = this.password
      ? bcryptjs.hashSync(this.password, 12)
      : "";

    // Added is_admin to insertion to respect the class property or default
    const query = `
      INSERT INTO Users (name, email, password_hash, is_admin, address_id, profile_pic_name) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return getDb().execute(query, [
      this.name,
      this.email,
      password_hash,
      this.is_admin,
      this.address_id,
      this.profile_pic_name,
    ]);
  }

  async login() {
    // 1. Fetch user by email
    // Changed 'user_id' to 'id' to match Schema
    const users = await getDb().query(
      "SELECT id, password_hash, is_admin, name, email FROM Users WHERE email = ?",
      [this.email]
    );

    if (!users || users.length === 0) {
      return { error: "Email not registered! Try Registering Instead!" };
    }

    const storedUser = users[0];

    // 2. Check Password
    const isAuthenticated = bcryptjs.compareSync(
      this.password,
      storedUser.password_hash
    );

    if (!isAuthenticated) {
      return { error: "Invalid Credentials" };
    }

    // 3. Return user info (useful for session/token)
    return {
      userId: storedUser.id,
      isAdmin: storedUser.is_admin === "Yes", // Convert ENUM to boolean for frontend
      name: storedUser.name,
      email: storedUser.email,
    };
  }

  static async findUserByEmail(email) {
    try {
      // SECURITY FIX: Used '?' instead of '${email}' to prevent SQL Injection
      const result = await getDb().query(
        "SELECT * FROM Users WHERE email = ? LIMIT 1",
        [email]
      );

      // MariaDB connector returns an array
      if (result && result.length > 0) {
        return new User(result[0]);
      } else {
        return null;
      }
    } catch (err) {
      console.log("Failed fetching user data from database", err);
      throw err;
    }
  }

  static async findById(userId) {
    if (!userId) {
      return null;
    }

    // Changed 'user_id' to 'id'
    const result = await getDb().query(
      "SELECT id, name, email, is_admin, address_id, profile_pic_name, joined_on FROM Users WHERE id = ?",
      [userId]
    );

    if (result && result.length > 0) {
      return new User(result[0]);
    }
    return null;
  }

  async isAdmin(userId) {
    try {
      // Changed 'user_id' to 'id'
      const result = await getDb().query(
        "SELECT is_admin FROM Users WHERE id = ?",
        [userId]
      );

      if (result.length === 0) {
        return false;
      }

      // Compare with ENUM string 'Yes'
      return result[0].is_admin === "Yes";
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // Refactored to actually work with dynamic updates
  async updateDetails() {
    let fields = [];
    let params = [];

    // Check which fields exist on the instance and build query dynamically
    if (this.name) {
      fields.push("name = ?");
      params.push(this.name);
    }
    if (this.email) {
      fields.push("email = ?");
      params.push(this.email);
    }
    if (this.address_id) {
      fields.push("address_id = ?");
      params.push(this.address_id);
    }
    if (this.profile_pic_name) {
      fields.push("profile_pic_name = ?");
      params.push(this.profile_pic_name);
    }

    if (fields.length === 0) {
      return; // Nothing to update
    }

    params.push(this.id); // Add ID for WHERE clause

    const query = `UPDATE Users SET ${fields.join(", ")} WHERE id = ?`;

    const result = await getDb().execute(query, params);
    return result;
  }

  async updatePassword(newPassword) {
    // Allow passing new password directly, or use this.password
    const passwordToHash = newPassword || this.password;

    const password_hash = bcryptjs.hashSync(passwordToHash, 12);

    return getDb().execute("UPDATE Users SET password_hash = ? WHERE id = ?", [
      password_hash,
      this.id,
    ]);
  }
}

module.exports = User;
