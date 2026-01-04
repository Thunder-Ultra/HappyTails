const { getDb } = require("../data/database");

async function getPetTypes(req, res, next) {
  try {
    const db = getDb();
    const types = await db.query("SELECT * FROM PetTypes ORDER BY name ASC");
    res.json(types);
  } catch (err) {
    next(err);
  }
}

async function getBreedsByType(req, res, next) {
  try {
    const db = getDb();
    const { typeId } = req.query;
    const breeds = await db.query(
      "SELECT * FROM PetBreeds WHERE type_id = ? ORDER BY name ASC",
      [typeId]
    );
    res.json(breeds);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPetTypes, getBreedsByType };
