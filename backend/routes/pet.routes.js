const express = require("express");
const router = express.Router();
const petController = require("../controllers/pet.controller");
const medicalUpload = require("../middlewares/medicalUpload");
const upload = require("../middlewares/upload"); // Ensure this points to your multer config

router.get("/", petController.getMyPets);
router.post("/", upload.single("pet_pic_name"), petController.addPet);
router.get("/:id/health", petController.getPetHealth);
router.patch("/:id", upload.single("pet_pic_name"), petController.updatePet);
router.delete("/:id", petController.deletePet);
router.post(
  "/:id/medical",
  medicalUpload.single("medical_file"),
  petController.uploadMedicalRecord
);
router.delete("/medical/:recordId", petController.deleteMedicalRecord);
router.post("/:id/stats", petController.addHealthStat);
router.delete("/stats/:statId", petController.deleteHealthStat);

module.exports = router;
