const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// All routes here are protected by checkAuth and isAdmin in app.js
router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.patch("/users/role", adminController.toggleAdminStatus);

router.post("/metadata/types", adminController.addPetType);
router.post("/metadata/breeds", adminController.addPetBreed);
router.delete("/metadata/breeds/:id", adminController.deleteBreed);

module.exports = router;
