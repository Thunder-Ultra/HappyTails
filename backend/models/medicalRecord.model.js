const { getDb } = require("./../data/database");

class MedicalRecord {
  constructor(data) {
    this.pet_id = data.pet_id;
    this.title = data.title;
    this.filename = data.filename;
  }

  static async deleteById(recordId) {
    const db = getDb();

    // 1. Fetch filename before deleting so we can remove it from disk
    const [record] = await db.query(
      "SELECT filename FROM PetMedicalRecords WHERE id = ?",
      [recordId]
    );

    if (!record) return null;

    // 2. Delete from DB
    await db.query("DELETE FROM PetMedicalRecords WHERE id = ?", [recordId]);

    return record.filename;
  }

  async save() {
    const db = getDb();
    const query = `
      INSERT INTO PetMedicalRecords (pet_id, title, filename) 
      VALUES (?, ?, ?)
    `;
    return await db.query(query, [this.pet_id, this.title, this.filename]);
  }

  static async findByPetId(petId) {
    const db = getDb();
    return await db.query(
      "SELECT * FROM PetMedicalRecords WHERE pet_id = ? ORDER BY added_on DESC",
      [petId]
    );
  }
}

module.exports = MedicalRecord;
