const { getDb } = require("./../data/database");

class Message {
  constructor(data) {
    this.id = data.id;
    this.adop_req_id = data.adop_req_id;
    this.sender_id = data.sender_id;
    this.content = data.content;
    this.is_read = data.is_read || 0; // Default to unread (0)
  }

  /**
   * Save a new message to the database
   */
  async save() {
    const db = getDb();
    const query = `
      INSERT INTO Messages (adop_req_id, sender_id, content, is_read)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const result = await db.query(query, [
        this.adop_req_id,
        this.sender_id,
        this.content,
        this.is_read,
      ]);
      return result.insertId || result[0]?.insertId;
    } catch (err) {
      console.error("Database Error in Message.save:", err);
      throw err;
    }
  }

  /**
   * Fetch chat history for a specific Adoption Request
   * Includes security: Verifies that the requesting userId is either
   * the Adopter OR the Caretaker associated with this request.
   */
  static async findByRequestId(requestId, userId) {
    const db = getDb();

    const query = `
      SELECT 
        m.id, 
        m.adop_req_id, 
        m.sender_id, 
        m.content, 
        m.sent_at, 
        m.is_read,
        u.name as sender_name
      FROM Messages m
      JOIN Users u ON m.sender_id = u.id
      JOIN AdoptionRequests ar ON m.adop_req_id = ar.id
      JOIN Adoptables a ON ar.adoptable_id = a.id
      WHERE m.adop_req_id = ? 
      AND (ar.adopter_id = ? OR a.caretaker_id = ?)
      ORDER BY m.sent_at ASC
    `;

    try {
      const rows = await db.query(query, [requestId, userId, userId]);
      return rows;
    } catch (err) {
      console.error("Database Error in Message.findByRequestId:", err);
      throw err;
    }
  }

  /**
   * Optional: Mark messages as read when a user opens the chat
   */
  static async markAsRead(requestId, userId) {
    const db = getDb();
    const query = `
      UPDATE Messages 
      SET is_read = 1 
      WHERE adop_req_id = ? AND sender_id != ?
    `;
    return await db.query(query, [requestId, userId]);
  }
}

module.exports = Message;
