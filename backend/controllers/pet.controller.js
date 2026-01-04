const Pet = require("../models/pet.model");
const fs = require("fs");
const path = require("path");
// const db = require("./../data/database");
const MedicalRecord = require("../models/medicalRecord.model");
const { file } = require("googleapis/build/src/apis/file");

async function addPet(req, res, next) {
  const userId = res.locals.userId;

  // pet_pic_name comes from the 'upload' middleware in the route
  const petPic = req.file ? req.file.filename : null;

  const newPet = new Pet({
    ...req.body,
    parent_id: userId,
    pet_pic_name: petPic,
  });

  try {
    await newPet.save();
    res.status(201).json({ message: "Pet added to your profile!" });
  } catch (err) {
    next(err);
  }
}

async function getPetHealth(req, res, next) {
  try {
    const data = await Pet.getHealthProfile(req.params.id, res.locals.userId);
    if (!data) return res.status(404).json({ msg: "Pet not found" });
    // console.log(data);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function updatePet(req, res, next) {
  const petId = req.params.id;
  const userId = res.locals.userId;

  try {
    // 1. If a new file was uploaded, handle the filename
    const newImage = req.file ? req.file.filename : null;

    // 2. Create model instance
    const updatedPet = new Pet({
      id: petId,
      parent_id: userId,
      ...req.body,
      pet_pic_name: newImage,
    });

    // 3. Save (Runs the UPDATE query)
    const result = await updatedPet.save();

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pet not found or unauthorized" });
    }

    res.json({ success: true, msg: "Pet updated successfully" });
  } catch (err) {
    next(err);
  }
}

async function getMyPets(req, res, next) {
  try {
    const userId = res.locals.userId;
    const pets = await Pet.findByOwner(userId);
    res.json(pets);
  } catch (err) {
    next(err);
  }
}

async function deletePet(req, res, next) {
  try {
    const petId = req.params.id;
    const userId = res.locals.userId;
    await Pet.deleteById(petId, userId);
    res.json({ message: "Pet deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// // controllers/pet.controller.js extension
// async function addHealthStat(req, res, next) {
//   try {
//     const { pet_id, type, value } = req.body;
//     const db = getDb();
//     await db.query(
//       "INSERT INTO PetHealthStats (pet_id, type, value, added_on) VALUES (?, ?, ?, NOW())",
//       [pet_id, type, value]
//     );
//     res.json({ msg: "Stat added" });
//   } catch (err) {
//     next(err);
//   }
// }

async function uploadMedicalRecord(req, res, next) {
  // 1. URL Parameter: Identifies WHICH pet owns this record
  const petId = req.params.id;
  // console.log(petId);

  // 2. req.body: Multer extracts text fields (like 'title') from FormData
  const { title } = req.body;

  // 3. req.file: Multer handles the binary file and gives us the metadata
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  try {
    // Instantiate the model just like your User model
    const newRecord = new MedicalRecord({
      pet_id: petId,
      title: title,
      filename: req.file.filename,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      msg: "Medical record saved successfully",
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMedicalRecord(req, res, next) {
  const { recordId } = req.params;

  try {
    const filename = await MedicalRecord.deleteById(recordId);

    if (!filename) {
      return res.status(404).json({ msg: "Record not found" });
    }

    // Delete the actual file from storage
    const filePath = path.join(
      __dirname,
      "../public/uploads/medical",
      filename
    );
    // console.log(filePath);

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file from disk:", err);
    });

    res.json({ success: true, msg: "Record deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// POST /api/pets/:id/stats
async function addHealthStat(req, res, next) {
  const { id } = req.params;
  const { type, value, added_on } = req.body;
  try {
    const db = require("./../data/database").getDb();
    await db.query(
      "INSERT INTO PetHealthStats (pet_id, type, value, added_on) VALUES (?, ?, ?, ?)",
      [id, type, value, added_on]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pets/stats/:statId
async function deleteHealthStat(req, res, next) {
  const { statId } = req.params;
  try {
    const db = require("./../data/database").getDb();
    await db.query("DELETE FROM PetHealthStats WHERE id = ?", [statId]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addPet,
  getPetHealth,
  updatePet,
  getMyPets,
  deletePet,
  addHealthStat,
  uploadMedicalRecord,
  deleteMedicalRecord,
  addHealthStat,
  deleteHealthStat,
};
