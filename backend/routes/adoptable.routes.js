const express = require("express");
const router = express.Router();
const adoptableController = require("../controllers/adoptable.controller");
const upload = require("../middlewares/upload");
// const checkAuth = require("../middlewares/checkAuthMiddleware");

// Public
router.get("/", adoptableController.getAdoptables);
router.get("/item/:id", adoptableController.getAdoptable);

// Protected (Requires login)
// router.use(checkAuth);

router.get("/my-listings", adoptableController.getMyAdoptables);
router.post("/", upload.array("images", 5), adoptableController.addAdoptable);
router.patch(
  "/:id",
  upload.array("images", 5),
  adoptableController.updateAdoptable
);
router.delete("/:id", adoptableController.deleteAdoptable);

module.exports = router;
