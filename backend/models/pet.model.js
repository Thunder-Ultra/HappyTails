const { getDb } = require("./../data/database");
const path = require("path");
const fs = require("fs");
const sanitizeEnum = require("./../utils/sanitzeEnum");

class Pet {
  constructor(petData) {
    this.id = petData.id;
    this.name = petData.name;
    this.parent_id = petData.parent_id; // The User ID who owns this pet
    this.address_id = petData.address_id;

    // Dates
    this.dob = petData.dob; // DATE
    this.last_vaccine_date = petData.last_vaccine_date; // TIMESTAMP in your schema

    // IDs
    this.breed_id = petData.breed_id;
    this.type_id = petData.type_id;

    // Single Image file name (VARCHAR 255 in your schema)
    this.pet_pic_name = petData.pet_pic_name;

    // ENUM Handling
    this.gender = sanitizeEnum(petData.gender, ["Male", "Female"], null);
    this.sterilized = sanitizeEnum(petData.sterilized, ["Yes", "No"], "No");
    this.de_wormed = sanitizeEnum(
      petData.de_wormed,
      ["Yes", "No", "Unknown"],
      "Unknown"
    );
    this.vaccinated = sanitizeEnum(
      petData.vaccinated,
      ["Yes", "No", "Partially", "Unknown"],
      "Unknown"
    );
  }

  async save() {
    const db = await getDb();

    // FIX: Convert empty strings to null, otherwise MariaDB throws Error 1292
    const dobFormatted = this.dob && this.dob.trim() !== "" ? this.dob : null;
    const vaccineDateFormatted =
      this.last_vaccine_date && this.last_vaccine_date.trim() !== ""
        ? this.last_vaccine_date
        : null;

    if (this.id) {
      const updateQuery = `
      UPDATE Pets 
      SET 
        name = ?, 
        gender = ?, 
        dob = ?, 
        breed_id = ?, 
        type_id = ?, 
        de_wormed = ?, 
        vaccinated = ?, 
        last_vaccine_date = ?, 
        sterilized = ?, 
        pet_pic_name = COALESCE(?, pet_pic_name),
        address_id = ?
      WHERE id = ? AND parent_id = ?
    `;

      return await db.query(updateQuery, [
        this.name,
        this.gender,
        dobFormatted, // Cleaned value
        this.breed_id,
        this.type_id,
        this.de_wormed,
        this.vaccinated,
        vaccineDateFormatted, // Cleaned value
        this.sterilized,
        this.pet_pic_name,
        this.address_id,
        this.id,
        this.parent_id,
      ]);
    } else {
      // Apply same logic for INSERT
      const insertQuery = `
      INSERT INTO Pets 
      (name, gender, dob, breed_id, type_id, de_wormed, vaccinated, last_vaccine_date, sterilized, pet_pic_name, address_id, parent_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
      return await db.query(insertQuery, [
        this.name,
        this.gender,
        dobFormatted,
        this.breed_id,
        this.type_id,
        this.de_wormed,
        this.vaccinated,
        vaccineDateFormatted,
        this.sterilized,
        this.pet_pic_name,
        this.address_id,
        this.parent_id,
      ]);
    }
  }

  // ---------------------------------------------------------
  // FIND BY ID (Single Pet Details)
  // ---------------------------------------------------------
  static async findById(petId) {
    const db = await getDb();
    const query = `
      SELECT 
        p.*,
        pb.name AS breed_name,
        pt.name AS type_name,
        a.town_city, a.state
      FROM Pets p
      LEFT JOIN PetBreeds pb ON p.breed_id = pb.id
      LEFT JOIN PetTypes pt ON p.type_id = pt.id
      LEFT JOIN Addresses a ON p.address_id = a.id
      WHERE p.id = ?
    `;

    const result = await db.query(query, [petId]);

    if (!result || result.length === 0) {
      return null;
    }

    return new Pet(result[0]); // Return object instance or raw data depending on preference
  }

  // ---------------------------------------------------------
  // FIND BY OWNER (Dashboard List)
  // ---------------------------------------------------------
  static async findByOwner(userId) {
    const db = await getDb();
    const query = `
      SELECT 
        p.id, p.name, p.pet_pic_name, p.gender, p.dob,
        p.type_id, p.breed_id, -- ENSURE THESE ARE HERE
        p.vaccinated, p.de_wormed, p.sterilized, -- ALSO THESE
        pb.name AS breed_name, 
        pt.name AS type_name
      FROM Pets p
      LEFT JOIN PetBreeds pb ON p.breed_id = pb.id
      LEFT JOIN PetTypes pt ON p.type_id = pt.id
      WHERE p.parent_id = ?
      ORDER BY p.id DESC
    `;

    const rows = await db.query(query, [userId]);
    return rows;
  }

  static async getHealthProfile(petId, userId) {
    const db = await getDb();

    // 1. Get Pet Core Info
    const [pet] = await db.query(
      `SELECT p.*, b.name as breed_name, t.name as type_name 
     FROM Pets p 
     LEFT JOIN PetBreeds b ON p.breed_id = b.id 
     LEFT JOIN PetTypes t ON p.type_id = t.id 
     WHERE p.id = ? AND p.parent_id = ?`,
      [petId, userId]
    );

    if (!pet) return null;

    // 2. Get Medical Records (PDFs/Images)
    const medicalRecords = await db.query(
      "SELECT * FROM PetMedicalRecords WHERE pet_id = ? ORDER BY added_on DESC",
      [petId]
    );

    // 3. Get Health Stats (Weight/Height history for charts)
    const healthStats = await db.query(
      "SELECT * FROM PetHealthStats WHERE pet_id = ? ORDER BY added_on ASC",
      [petId]
    );

    return { ...pet, medicalRecords, healthStats };
  }

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  static async deleteById(petId, ownerId) {
    const db = await getDb();
    try {
      // 1. Fetch image to delete from disk first
      const fileQuery = `SELECT pet_pic_name FROM Pets WHERE id = ? AND parent_id = ?`;
      const [pet] = await db.query(fileQuery, [petId, ownerId]);

      if (!pet) {
        throw new Error("Pet not found or unauthorized");
      }

      if (pet.pet_pic_name) {
        const filePath = path.join(
          __dirname,
          "../public/uploads/pets",
          pet.pet_pic_name
        );
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT")
            console.error("Failed to delete pet image:", err);
        });
      }

      // 2. Delete Health Records first (Foreign Key constraint might strictly enforce this,
      // but if ON DELETE CASCADE isn't set in DB, we must do it manually)
      await db.query("DELETE FROM PetMedicalRecords WHERE pet_id = ?", [petId]);
      await db.query("DELETE FROM PetHealthStats WHERE pet_id = ?", [petId]);

      // 3. Delete the Pet
      const result = await db.query(
        `DELETE FROM Pets WHERE id = ? AND parent_id = ?`,
        [petId, ownerId]
      );
      return result;
    } catch (err) {
      console.error("Error deleting pet:", err);
      throw err;
    }
  }
}

module.exports = Pet;
