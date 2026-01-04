const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const checkAuth = require("../middlewares/checkAuthMiddleware");

router.use(checkAuth);

// GET /api/messages/5
router.get("/:requestId", messageController.getChatHistory);

// POST /api/messages
router.post("/", messageController.sendMessage);

module.exports = router;
