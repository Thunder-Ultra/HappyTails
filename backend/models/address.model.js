const { getDb } = require("./../data/database");

class Address {
  constructor(data) {
    this.id = data.id;
    this.house_no = data.house_no;
    this.street = data.street;
    this.landmark = data.landmark;
    this.pincode = data.pincode;
    this.town_city = data.town_city;
    this.state = data.state;
  }

  async save() {
    const db = getDb();
    if (this.id) {
      await db.query(
        "UPDATE Addresses SET house_no=?, street=?, landmark=?, pincode=?, town_city=?, state=? WHERE id=?",
        [
          this.house_no,
          this.street,
          this.landmark,
          this.pincode,
          this.town_city,
          this.state,
          this.id,
        ]
      );
      return this.id;
    } else {
      const res = await db.query(
        "INSERT INTO Addresses (house_no, street, landmark, pincode, town_city, state) VALUES (?, ?, ?, ?, ?, ?)",
        [
          this.house_no,
          this.street,
          this.landmark,
          this.pincode,
          this.town_city,
          this.state,
        ]
      );
      return res.insertId;
    }
  }
}

module.exports = Address;
