const { getDb } = require("./../data/database");
const sanitizeEnum = require("./../utils/sanitzeEnum");

class AdoptionRequest {
  constructor(data) {
    this.id = data.id;
    this.adoptable_id = data.adoptable_id;
    this.adopter_id = data.adopter_id;
    this.message = data.message;
    this.status = sanitizeEnum(
      data.status,
      ["Pending", "Interviewing", "Approved", "Rejected"],
      "Pending"
    );
  }

  async save() {
    const db = await getDb();
    const query = `
      INSERT INTO AdoptionRequests (adoptable_id, adopter_id, message, status)
      VALUES (?, ?, ?, ?)
    `;
    const result = await db.query(query, [
      this.adoptable_id,
      this.adopter_id,
      this.message,
      this.status,
    ]);
    return result.insertId || result[0]?.insertId;
  }

  /**
   * Check if a user has already applied for a specific pet
   */
  static async exists(adopterId, adoptableId) {
    const db = await getDb();
    const rows = await db.query(
      "SELECT id FROM AdoptionRequests WHERE adopter_id = ? AND adoptable_id = ?",
      [adopterId, adoptableId]
    );
    return rows.length > 0;
  }

  /**
   * For Adopters: See pets I have applied for
   */
  static async findByAdopter(adopterId) {
    const db = await getDb();
    const query = `
      SELECT ar.id, ar.status, ar.created_at, ar.message,
             a.name AS pet_name, a.id AS pet_id,
             u.name AS caretaker_name,
             (SELECT filename FROM AdoptableImages WHERE adoptable_id = a.id LIMIT 1) as pet_image
      FROM AdoptionRequests ar
      JOIN Adoptables a ON ar.adoptable_id = a.id
      JOIN Users u ON a.caretaker_id = u.id
      WHERE ar.adopter_id = ?
      ORDER BY ar.created_at DESC
    `;
    return await db.query(query, [adopterId]);
  }

  /**
   * For Caretakers: See who applied for my pets
   */
  static async findIncomingRequests(caretakerId) {
    const db = await getDb();
    const query = `
      SELECT ar.id, ar.status, ar.created_at, ar.message,
             a.name AS pet_name, u.name AS applicant_name, u.id AS applicant_id
      FROM AdoptionRequests ar
      JOIN Adoptables a ON ar.adoptable_id = a.id
      JOIN Users u ON ar.adopter_id = u.id
      WHERE a.caretaker_id = ?
      ORDER BY ar.created_at DESC
    `;
    return await db.query(query, [caretakerId]);
  }

  /**
   * Fetch full details including the Adopter's Profile for the Caretaker to review
   */
  static async findById(requestId) {
    const db = await getDb();
    const query = `
      SELECT ar.*, 
             a.name AS pet_name, a.caretaker_id, a.id as pet_id,
             u.name AS applicant_name, u.email AS applicant_email,
             up.occupation, up.housing_type, up.experience_level, up.has_fenced_yard, up.has_kids, up.daily_hours_away
      FROM AdoptionRequests ar
      JOIN Adoptables a ON ar.adoptable_id = a.id
      JOIN Users u ON ar.adopter_id = u.id
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE ar.id = ?
    `;
    const rows = await db.query(query, [requestId]);
    return rows[0] || null;
  }

  static async updateStatus(requestId, caretakerId, newStatus) {
    const db = await getDb();

    // Verify caretaker owns the pet before updating status
    const result = await db.query(
      `
      UPDATE AdoptionRequests ar
      JOIN Adoptables a ON ar.adoptable_id = a.id
      SET ar.status = ?
      WHERE ar.id = ? AND a.caretaker_id = ?
    `,
      [newStatus, requestId, caretakerId]
    );

    // If approved, put the pet on 'Hold'
    if (newStatus === "Approved") {
      await db.query(
        `
        UPDATE Adoptables a
        JOIN AdoptionRequests ar ON a.id = ar.adoptable_id
        SET a.status = 'Hold'
        WHERE ar.id = ?
      `,
        [requestId]
      );
    }

    return result.affectedRows > 0;
  }
}

module.exports = AdoptionRequest;
