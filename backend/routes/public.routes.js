const express = require("express");
const publicController = require("./../controllers/public.controller");
const router = express.Router();

router.get("/pet-types", publicController.getPetTypes);
router.get("/pet-breeds", publicController.getBreedsByType);

module.exports = router;
