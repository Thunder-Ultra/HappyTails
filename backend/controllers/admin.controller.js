const { getDb } = require("../data/database");

// --- 1. SYSTEM STATS ---
async function getDashboardStats(req, res, next) {
  try {
    const db = getDb();
    const stats = {
      totalUsers: (await db.query("SELECT COUNT(*) as count FROM Users"))[0]
        .count,
      totalAdoptables: (
        await db.query("SELECT COUNT(*) as count FROM Adoptables")
      )[0].count,
      pendingRequests: (
        await db.query(
          "SELECT COUNT(*) as count FROM AdoptionRequests WHERE status='Pending'"
        )
      )[0].count,
      successfulAdoptions: (
        await db.query(
          "SELECT COUNT(*) as count FROM Adoptables WHERE status='Adopted'"
        )
      )[0].count,
    };
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getInventoryDetails(req, res, next) {
  try {
    const db = getDb();

    // 1. Get all Pet Types with a count of current Adoptables
    const types = await db.query(`
      SELECT pt.id, pt.name, 
      (SELECT COUNT(*) FROM Adoptables WHERE type_id = pt.id) as adoptable_count 
      FROM PetTypes pt 
      ORDER BY pt.name ASC
    `);

    // 2. Get all Breeds with their Type names
    const breeds = await db.query(`
      SELECT pb.id, pb.name, pt.name as type_name 
      FROM PetBreeds pb
      JOIN PetTypes pt ON pb.type_id = pt.id
      ORDER BY pt.name, pb.name ASC
    `);

    res.json({ types, breeds });
  } catch (err) {
    next(err);
  }
}

// --- 2. USER MANAGEMENT ---
async function getAllUsers(req, res, next) {
  try {
    const users = await getDb().query(
      "SELECT id, name, email, is_admin, joined_on FROM Users ORDER BY joined_on DESC"
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function toggleAdminStatus(req, res, next) {
  const { userId, status } = req.body; // status: 'Yes' or 'No'
  try {
    await getDb().query("UPDATE Users SET is_admin = ? WHERE id = ?", [
      status,
      userId,
    ]);
    res.json({ success: true, msg: `User admin status set to ${status}` });
  } catch (err) {
    next(err);
  }
}

// --- 3. METADATA MANAGEMENT (Types & Breeds) ---
async function addPetType(req, res, next) {
  try {
    const { name } = req.body;
    await getDb().query("INSERT INTO PetTypes (name) VALUES (?)", [name]);
    res.json({ success: true, msg: "New pet type added" });
  } catch (err) {
    next(err);
  }
}

async function addPetBreed(req, res, next) {
  try {
    const { name, type_id } = req.body;
    await getDb().query("INSERT INTO PetBreeds (name, type_id) VALUES (?, ?)", [
      name,
      type_id,
    ]);
    res.json({ success: true, msg: "New breed added" });
  } catch (err) {
    next(err);
  }
}

async function deleteBreed(req, res, next) {
  try {
    await getDb().query("DELETE FROM PetBreeds WHERE id = ?", [req.params.id]);
    res.json({ success: true, msg: "Breed removed" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleAdminStatus,
  addPetType,
  addPetBreed,
  deleteBreed,
  getInventoryDetails,
};
