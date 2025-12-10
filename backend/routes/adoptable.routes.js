const { Router } = require("express");
const adoptableController = require("./../controllers/adoptable.controller");
const upload = require("./../middlewares/upload");

const router = new Router();

// /api/adoptables/

router.post("/", upload.array("images", 5), adoptableController.addAdoptable);

// For Listing the Pets added for adoption by you
router.get("/my", adoptableController.getMyAdoptables);

router.get("/", adoptableController.getAdoptables);

router.get("/:id", adoptableController.getAdoptable);

router.put(
  "/:id",
  upload.array("images", 5),
  adoptableController.updateAdoptable
);

// For Anyone Looking for Adopting a Pet

router.get("/adoption-requests", adoptableController.getAdopRequests);

router.delete("/:id", adoptableController.deleteAdoptable);

module.exports = router;
