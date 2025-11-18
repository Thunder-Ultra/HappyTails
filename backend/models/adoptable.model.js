const { getDb } = require("./../data/database");

class Adoptable {
  constructor(adoptableData) {
    this.adoptableId = adoptableData.id;
    this.adoptableName = adoptableData.name;
  }
  static async getAdoptablesInPages(page = 1, limit = 20, search = "") {
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const query = `
      SELECT 
        a.adoptable_id AS id,
        a.name,
        a.dob,
        a.de_wormed,
        a.vaccinated,
        a.vaccination_date,
        a.sterilized,
        a.house_trained,
        a.pet_friendly,
        pb.name AS breed,
        pt.name AS type,
        u.name AS caretaker
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.breed_id
      LEFT JOIN PetTypes pt ON a.type_id = pt.type_id
      LEFT JOIN Users u ON a.caretaker_id = u.user_id
      WHERE 1=1
      ${search ? `AND (a.name LIKE ? OR pb.name LIKE ? OR pt.name LIKE ?)` : ""}
      ORDER BY a.added_on DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const params = search
      ? [searchTerm, searchTerm, searchTerm]
      : [limit, offset];

    const adoptables = await getDb().query(query, params);

    // Count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Adoptables a
      LEFT JOIN PetBreeds pb ON a.breed_id = pb.breed_id
      LEFT JOIN PetTypes pt ON a.type_id = pt.type_id
      WHERE 1=1
      ${
        search
          ? `AND (a.name LIKE ? OR pb.breed_name LIKE ? OR pt.type_name LIKE ?)`
          : ""
      }
    `;

    const countParams = search ? [searchTerm, searchTerm, searchTerm] : [];

    const totalResult = await getDb().query(countQuery, countParams);
    const total = parseInt(totalResult[0].total);
    const pages = Math.ceil(total / limit);
    return { adoptables, total, page, pages };
  }
}

module.exports = Adoptable;
