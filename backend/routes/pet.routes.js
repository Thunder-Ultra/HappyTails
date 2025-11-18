const { Router } = require("express");
const petController = require("./../controllers/pet.controller");
const { route } = require("./auth.routes");

const router = new Router();

module.exports = router;
