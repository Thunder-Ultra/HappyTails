const { getDb } = require("./../data/database");
const path = require("path");
const fs = require("fs");

class Adoptable {
  constructor(adoptableData) {
    // If updating, this ID will be present
    this.id = adoptableData.id;

    this.caretakerId = adoptableData.caretaker_id;
    this.name = adoptableData.name;
    this.age = adoptableData.age;
    this.weight = adoptableData.weight;
    this.height = adoptableData.height;

    this.breedName = adoptableData.breed;
    this.typeName = adoptableData.type;

    // Convert Boolean/String/Number to ENUM("Yes", "No")
    const isTrue =
      adoptableData.vaccinated === true ||
      adoptableData.vaccinated === "true" ||
      adoptableData.vaccinated === 1;
    this.isVaccinated = isTrue ? "Yes" : "No";

    this.address = adoptableData.address;
    this.description = adoptableData.description;

    // Ensure images is always an array of strings (filenames)
    this.images = Array.isArray(adoptableData.images)
      ? adoptableData.images
      : [adoptableData.images].filter(Boolean);
  }

  async save() {
    const db = getDb();

    // 1. Find Type ID (Common for both Insert and Update)
    let typeId = null;
    if (this.typeName) {
      const [typeResult] = await db.query(
        "SELECT type_id FROM PetTypes WHERE name = ?",
        [this.typeName]
      );
      typeId = typeResult ? typeResult.type_id : null;
    }

    // 2. Find Breed ID (Common for both Insert and Update)
    let breedId = null;
    if (this.breedName) {
      const [breedResult] = await db.query(
        "SELECT breed_id FROM PetBreeds WHERE name = ?",
        [this.breedName]
      );
      breedId = breedResult ? breedResult.breed_id : null;
    }

    // ---------------------------------------------------------
    // CASE A: UPDATE (If this.id exists)
    // ---------------------------------------------------------
    if (this.id) {
      const updateQuery = `
        UPDATE Adoptables 
        SET 
          name = ?, 
          age = ?, 
          weight = ?, 
          height = ?, 
          vaccinated = ?, 
          Addr = ?, 
          \`Desc\` = ?,
          breed_id = COALESCE(?, breed_id),
          type_id = COALESCE(?, type_id)
        WHERE id = ? AND caretaker_id = ?
      `;

      await db.query(updateQuery, [
        this.name,
        this.age,
        this.weight,
        this.height,
        this.isVaccinated,
        this.address,
        this.description,
        breedId, // Can be null if not changing
        typeId, // Can be null if not changing
        this.id,
        this.caretakerId, // Security check: Ensure user owns this pet
      ]);

      // Handle New Images for Update
      if (this.images && this.images.length > 0) {
        const imageQuery = `INSERT INTO AdoptablesMedia (adoptable_id, type, filename) VALUES (?, ?, ?)`;
        const imageValues = this.images.map((filename) => [
          this.id,
          "Image",
          filename,
        ]);
        await db.batch(imageQuery, imageValues);
      }

      return this.id; // Return the existing ID
    }

    // ---------------------------------------------------------
    // CASE B: INSERT (New Record)
    // ---------------------------------------------------------
    else {
      const insertQuery = `
        INSERT INTO Adoptables 
        (caretaker_id, name, age, weight, height, breed_id, type_id, vaccinated, Addr, \`Desc\`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await db.query(insertQuery, [
        this.caretakerId,
        this.name,
        this.age,
        this.weight,
        this.height,
        breedId,
        typeId,
        this.isVaccinated,
        this.address,
        this.description,
      ]);

      // Capture the new ID
      const newAdoptableId = Number(result.insertId);

      // Insert Images
      if (this.images && this.images.length > 0 && newAdoptableId) {
        const imageQuery = `INSERT INTO AdoptablesMedia (adoptable_id, type, filename) VALUES (?, ?, ?)`;
        const imageValues = this.images.map((filename) => [
          newAdoptableId,
          "Image",
          filename,
        ]);
        await db.batch(imageQuery, imageValues);
      }

      return newAdoptableId;
    }
  }

  // ... (rest of your static methods like findById, deleteById, etc. remain unchanged)
  static async findById(id) {
    const query = `
      SELECT 
        a.*,
        a.Addr as address, 
        a.\`Desc\` as description,
        GROUP_CONCAT(am.filename) as images
      FROM Adoptables a
      LEFT JOIN AdoptablesMedia am ON a.id = am.adoptable_id
      WHERE a.id = ?
      GROUP BY a.id
    `;
    const [rows] = await getDb().query(query, [id]);

    if (!rows) return null;

    if (rows.images) {
      rows.images = rows.images.split(",");
    } else {
      rows.images = [];
    }

    return rows;
  }

  static async getAdoptablesInPages(page = 1, limit = 20, search = "") {
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const query = `
      SELECT 
        a.id,
        a.name,
        a.age,
        a.weight,
        a.height,
        a.vaccinated,
        a.Addr as address, 
        a.\`Desc\` as description,
        pb.name AS breed,
        pt.name AS type,
        u.name AS caretaker,
        a.caretaker_id,
        GROUP_CONCAT(am.filename) as images
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.breed_id
      LEFT JOIN PetTypes pt ON a.type_id = pt.type_id
      LEFT JOIN Users u ON a.caretaker_id = u.user_id
      LEFT JOIN AdoptablesMedia am ON a.id = am.adoptable_id
      WHERE 1=1
      ${search ? `AND (a.name LIKE ? OR pb.name LIKE ? OR pt.name LIKE ?)` : ""}
      GROUP BY a.id
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `;

    const params = search
      ? [searchTerm, searchTerm, searchTerm, limit, offset]
      : [limit, offset];

    const adoptables = await getDb().query(query, params);

    const formattedAdoptables = adoptables.map((pet) => ({
      ...pet,
      images: pet.images ? pet.images.split(",") : [],
    }));

    const countQuery = `
      SELECT COUNT(DISTINCT a.id) AS total
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.breed_id
      LEFT JOIN PetTypes pt ON a.type_id = pt.type_id
      WHERE 1=1
      ${search ? `AND (a.name LIKE ? OR pb.name LIKE ? OR pt.name LIKE ?)` : ""}
    `;

    const countParams = search ? [searchTerm, searchTerm, searchTerm] : [];

    const [countResult] = await getDb().query(countQuery, countParams);
    const total = countResult ? parseInt(countResult.total) : 0;

    const pages = Math.ceil(total / limit);
    return { adoptables: formattedAdoptables, total, page, pages };
  }

  static async getMyAdoptablesByCaretakerId(caretaker_id) {
    try {
      const query = `
        SELECT 
          a.id,
          a.name,
          a.age,
          a.weight,
          a.height,
          a.vaccinated,
          a.Addr as address,
          a.\`Desc\` as description,
          pb.name AS breed,
          pt.name AS type,
          a.caretaker_id,
          'available' as status,
          GROUP_CONCAT(am.filename) as images
        FROM Adoptables a
        LEFT JOIN PetBreeds pb ON a.breed_id = pb.breed_id
        LEFT JOIN PetTypes pt ON a.type_id = pt.type_id
        LEFT JOIN AdoptablesMedia am ON a.id = am.adoptable_id
        WHERE a.caretaker_id = ?
        GROUP BY a.id
        ORDER BY a.id DESC
      `;
      const result = await getDb().query(query, [caretaker_id]);

      return result.map((pet) => ({
        ...pet,
        images: pet.images ? pet.images.split(",") : [],
      }));
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async deleteById(petId) {
    const db = getDb();
    try {
      const mediaQuery = `SELECT filename FROM AdoptablesMedia WHERE adoptable_id = ?`;
      const mediaFiles = await db.query(mediaQuery, [petId]);

      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          const filePath = path.join(
            __dirname,
            "../public/uploads/adoptables",
            file.filename
          );
          fs.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") console.error(err);
          });
        });
      }

      await db.query(`DELETE FROM AdoptablesMedia WHERE adoptable_id = ?`, [
        petId,
      ]);
      return await db.query(`DELETE FROM Adoptables WHERE id = ?`, [petId]);
    } catch (err) {
      console.error("Error deleting adoptable:", err);
      throw err;
    }
  }
}

module.exports = Adoptable;
