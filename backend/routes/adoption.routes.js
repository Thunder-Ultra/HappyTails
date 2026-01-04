const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoption.controller");
const checkAuth = require("../middlewares/checkAuthMiddleware");

router.use(checkAuth); // All adoption actions require login

router.post("/apply", adoptionController.applyForPet);
router.get("/my-applications", adoptionController.getMyApplications);
router.get("/incoming", adoptionController.getIncomingRequests);
router.get("/request/:id", adoptionController.getRequestDetails);
router.patch("/status/:id", adoptionController.updateStatus);

module.exports = router;
