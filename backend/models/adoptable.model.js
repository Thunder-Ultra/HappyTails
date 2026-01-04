const { getDb } = require("./../data/database");
const path = require("path");
const fs = require("fs");
const sanitizeEnum = require("./../utils/sanitzeEnum");

class Adoptable {
  constructor(data) {
    this.id = data.id;
    this.caretaker_id = data.caretaker_id;
    this.name = data.name;
    this.gender = data.gender;
    this.dob = data.dob;
    this.weight_kg = data.weight_kg || 0;
    this.description = data.description;
    this.address_id = data.address_id;
    this.breed_id = data.breed_id;
    this.type_id = data.type_id;
    this.last_vaccine_date = data.last_vaccine_date || null;

    // ENUM Sanitization
    this.sterilized = sanitizeEnum(
      data.sterilized,
      ["Yes", "No", "Unknown"],
      "Unknown"
    );
    this.vaccinated = sanitizeEnum(
      data.vaccinated,
      ["Yes", "No", "Partially", "Unknown"],
      "Unknown"
    );
    this.de_wormed = sanitizeEnum(
      data.de_wormed,
      ["Yes", "No", "Unknown"],
      "Unknown"
    );
    this.house_trained = sanitizeEnum(
      data.house_trained,
      ["Yes", "No", "In-Training"],
      "In-Training"
    );
    this.status = sanitizeEnum(
      data.status,
      ["Available", "Adopted", "Hold"],
      "Available"
    );

    // Images logic
    this.images = Array.isArray(data.images) ? data.images : [];

    // Parse filenames user wants to KEEP (passed as JSON string from Frontend)
    try {
      this.remainingImages =
        typeof data.remainingImages === "string"
          ? JSON.parse(data.remainingImages)
          : data.remainingImages || [];
    } catch (e) {
      this.remainingImages = [];
    }
  }

  async save() {
    const db = await getDb();

    // Robust Date Parsing helper
    const formatDateForDb = (dateInput) => {
      if (!dateInput || dateInput.trim() === "") return null;
      try {
        // Ensure it's in YYYY-MM-DD format
        return new Date(dateInput).toISOString().split("T")[0];
      } catch (e) {
        return null;
      }
    };

    const dobDb = formatDateForDb(this.dob);
    const vaxDb = formatDateForDb(this.last_vaccine_date);

    if (this.id) {
      const updateQuery = `
      UPDATE Adoptables SET 
        name=?, gender=?, dob=?, weight_kg=?, description=?, sterilized=?, 
        vaccinated=?, last_vaccine_date=?, de_wormed=?, house_trained=?, 
        status=?, breed_id=?, type_id=?, address_id=?
      WHERE id = ? AND caretaker_id = ?
    `;
      await db.query(updateQuery, [
        this.name,
        this.gender,
        dobDb,
        this.weight_kg,
        this.description,
        this.sterilized,
        this.vaccinated,
        vaxDb,
        this.de_wormed,
        this.house_trained,
        this.status,
        this.breed_id,
        this.type_id,
        this.address_id,
        this.id,
        this.caretaker_id,
      ]);
      // ... handle images ...
    } else {
      // ... handle insert ...
      // Use dobDb and vaxDb in your parameters array here as well
    }
  }

  async saveImages(adoptableId) {
    const db = await getDb();
    const imageValues = this.images.map((filename, index) => [
      adoptableId,
      filename,
      index === 0 ? 1 : 0,
    ]);
    if (imageValues.length > 0) {
      await db.batch(
        "INSERT INTO AdoptableImages (adoptable_id, filename, is_primary) VALUES (?, ?, ?)",
        imageValues
      );
    }
  }

  static async getMyAdoptablesByCaretakerId(caretakerId) {
    const db = await getDb();
    const query = `
      SELECT a.*, pb.name AS breed, pt.name AS type,
             GROUP_CONCAT(ai.filename ORDER BY ai.is_primary DESC) as images
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.id
      LEFT JOIN PetTypes pt ON a.type_id = pt.id
      LEFT JOIN AdoptableImages ai ON a.id = ai.adoptable_id
      WHERE a.caretaker_id = ?
      GROUP BY a.id ORDER BY a.added_on DESC
    `;
    const rows = await db.query(query, [caretakerId]);
    return rows.map((r) => ({
      ...r,
      images: r.images ? r.images.split(",") : [],
    }));
  }

  static async findById(id) {
    const db = await getDb();
    const query = `
      SELECT 
        a.*, 
        pb.name AS breed_name, 
        pt.name AS type_name,
        u.name AS caretaker_name, -- ADDED THIS: Fetch name from Users table
        addr.town_city, 
        addr.state,
        GROUP_CONCAT(ai.filename ORDER BY ai.is_primary DESC) as images
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.id
      LEFT JOIN PetTypes pt ON a.type_id = pt.id
      LEFT JOIN Users u ON a.caretaker_id = u.id -- ADDED THIS: Join Users table
      LEFT JOIN Addresses addr ON a.address_id = addr.id
      LEFT JOIN AdoptableImages ai ON a.id = ai.adoptable_id
      WHERE a.id = ?
      GROUP BY a.id
    `;

    try {
      const rows = await db.query(query, [id]);

      if (!rows || rows.length === 0) return null;

      const row = rows[0];
      row.images = row.images ? row.images.split(",") : [];

      return row;
    } catch (err) {
      console.error("Database error in Adoptable.findById:", err);
      throw err;
    }
  }

  static async deleteById(adoptableId, caretakerId) {
    const db = await getDb();
    const mediaFiles = await db.query(
      "SELECT filename FROM AdoptableImages WHERE adoptable_id = ?",
      [adoptableId]
    );
    mediaFiles.forEach((f) => {
      fs.unlink(
        path.join(__dirname, "../public/uploads/", f.filename),
        (err) => {}
      );
    });
    await db.query("DELETE FROM AdoptableImages WHERE adoptable_id = ?", [
      adoptableId,
    ]);
    return await db.query(
      "DELETE FROM Adoptables WHERE id = ? AND caretaker_id = ?",
      [adoptableId, caretakerId]
    );
  }
  static async getAdoptablesInPages(
    page = 1,
    limit = 20,
    filters = {},
    currentUser // Pass res.locals.userId here
  ) {
    const db = await getDb();
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, pb.name AS breed, pt.name AS type, addr.town_city, addr.state,
            u.name AS caretaker_name,
            TIMESTAMPDIFF(YEAR, a.dob, CURDATE()) AS age,
            (SELECT filename FROM AdoptableImages WHERE adoptable_id = a.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.id
      LEFT JOIN PetTypes pt ON a.type_id = pt.id
      LEFT JOIN Addresses addr ON a.address_id = addr.id
      LEFT JOIN Users u ON a.caretaker_id = u.id
      WHERE a.status = 'Available'
    `;

    const params = [];

    // 1. Logic to exclude current user's own listings
    if (currentUser) {
      query += ` AND a.caretaker_id != ?`;
      params.push(currentUser);
    }

    // 2. Search query (Name/Breed/Type)
    if (filters.search) {
      query += ` AND (a.name LIKE ? OR pb.name LIKE ? OR pt.name LIKE ?)`;
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }

    // 3. Specific Filters
    if (filters.type_id && filters.type_id !== "all") {
      query += ` AND a.type_id = ?`;
      params.push(filters.type_id);
    }
    if (filters.gender && filters.gender !== "all") {
      query += ` AND a.gender = ?`;
      params.push(filters.gender);
    }
    if (filters.minAge) {
      query += ` AND TIMESTAMPDIFF(YEAR, a.dob, CURDATE()) >= ?`;
      params.push(filters.minAge);
    }
    if (filters.maxAge) {
      query += ` AND TIMESTAMPDIFF(YEAR, a.dob, CURDATE()) <= ?`;
      params.push(filters.maxAge);
    }
    if (filters.vaccinated === "true") {
      query += ` AND a.vaccinated = 'Yes'`;
    }

    // 4. Pagination (These must always be the last parameters)
    query += ` ORDER BY a.added_on DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await db.query(query, params);
    return rows;
  }
}

module.exports = Adoptable;
