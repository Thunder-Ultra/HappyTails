const { Router } = require("express");
const publicController = require("./../controllers/public.controller");

const router = Router();

router.get("/", publicController.getIntro);

router.get("/contact", publicController.getContact);

router.get("/features", publicController.getFeatures);

module.exports = router;
