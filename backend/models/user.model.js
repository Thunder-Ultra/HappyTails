const bcryptjs = require("bcryptjs");
const { getDb } = require("./../data/database");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.is_admin = userData.is_admin || "No";
    this.address_id = userData.address_id || null;
    this.profile_pic_name = userData.profile_pic_name || null;
  }

  /**
   * 1. The "Master" Update Function
   * This fixes your 'updateDetails is not a function' error.
   * It orchestrates the update across three tables.
   */
  async updateDetails(baseData, profileData, addressData) {
    const db = getDb();

    try {
      // Step A: Update core User table (Name)
      if (baseData.name) {
        await db.query("UPDATE Users SET name = ? WHERE id = ?", [
          baseData.name,
          this.id,
        ]);
      }

      // Step B: Update Address (if provided)
      if (addressData) {
        await this.updateAddress(addressData);
      }

      // Step C: Update UserProfile (if provided)
      if (profileData) {
        await this.updateAdoptionProfile(profileData);
      }

      return { success: true };
    } catch (err) {
      console.error("Model Error: updateDetails failed", err);
      throw err;
    }
  }

  /**
   * 2. Handle UserProfiles Table (Upsert)
   * Uses ON DUPLICATE KEY UPDATE so it works even if the row doesn't exist yet
   */
  async updateAdoptionProfile(p) {
    const db = getDb();
    const query = `
      INSERT INTO UserProfiles 
        (user_id, occupation, daily_hours_away, housing_type, ownership_status, has_fenced_yard, has_kids, other_pet_details, experience_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        occupation = VALUES(occupation),
        daily_hours_away = VALUES(daily_hours_away),
        housing_type = VALUES(housing_type),
        ownership_status = VALUES(ownership_status),
        has_fenced_yard = VALUES(has_fenced_yard),
        has_kids = VALUES(has_kids),
        other_pet_details = VALUES(other_pet_details),
        experience_level = VALUES(experience_level)
    `;

    return await db.query(query, [
      this.id,
      p.occupation,
      p.daily_hours_away,
      p.housing_type,
      p.ownership_status,
      p.has_fenced_yard,
      p.has_kids,
      p.other_pet_details,
      p.experience_level,
    ]);
  }

  /**
   * 3. Handle Addresses Table
   * Checks if user has an address_id; if not, creates one and links it.
   */
  async updateAddress(a) {
    const db = getDb();

    // Check if we need to INSERT or UPDATE
    if (this.address_id) {
      const query = `
        UPDATE Addresses 
        SET house_no = ?, street = ?, landmark = ?, pincode = ?, town_city = ?, state = ? 
        WHERE id = ?
      `;
      return await db.query(query, [
        a.house_no,
        a.street,
        a.landmark,
        a.pincode,
        a.town_city,
        a.state,
        this.address_id,
      ]);
    } else {
      const query = `
        INSERT INTO Addresses (house_no, street, landmark, pincode, town_city, state) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await db.query(query, [
        a.house_no,
        a.street,
        a.landmark,
        a.pincode,
        a.town_city,
        a.state,
      ]);
      const newAddressId = result.insertId || result[0].insertId;

      // Link the new address back to the User
      await db.query("UPDATE Users SET address_id = ? WHERE id = ?", [
        newAddressId,
        this.id,
      ]);
      this.address_id = newAddressId; // Update instance property
      return newAddressId;
    }
  }

  // --- EXISTING METHODS (STAY THE SAME) ---

  async login() {
    const db = getDb();
    const rows = await db.query(
      "SELECT id, name, email, password_hash, is_admin FROM Users WHERE email = ? LIMIT 1",
      [this.email]
    );
    const user = rows[0];
    if (!user) return { error: "Email not registered!" };
    if (!bcryptjs.compareSync(this.password, user.password_hash))
      return { error: "Invalid credentials" };
    return {
      userId: user.id,
      name: user.name,
      isAdmin: user.is_admin === "Yes",
    };
  }

  async register() {
    const db = getDb();
    const hash = bcryptjs.hashSync(this.password, 12);
    const query = `INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)`;
    const result = await db.query(query, [this.name, this.email, hash]);
    return result.insertId || result[0]?.insertId;
  }

  static async findUserByEmail(email) {
    const db = getDb();
    const result = await db.query(
      "SELECT * FROM Users WHERE email = ? LIMIT 1",
      [email]
    );
    return result[0] || null;
  }

  static async findById(userId) {
    const db = getDb();
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.is_admin, 
        u.profile_pic_name, 
        u.address_id, 
        u.joined_on,
        -- UserProfiles fields
        up.occupation, 
        up.daily_hours_away, 
        up.housing_type, 
        up.ownership_status, 
        up.has_fenced_yard, 
        up.has_kids, 
        up.other_pet_details, 
        up.experience_level,
        -- Addresses fields
        addr.house_no, 
        addr.street, 
        addr.landmark, 
        addr.pincode, 
        addr.town_city, 
        addr.state
      FROM Users u
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      LEFT JOIN Addresses addr ON u.address_id = addr.id
      WHERE u.id = ?
    `;

    try {
      const rows = await db.query(query, [userId]);

      // MariaDB returns an array. We return the first object or null.
      if (!rows || rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      console.error("Database error in User.findById:", err);
      throw err;
    }
  }
}

module.exports = User;
