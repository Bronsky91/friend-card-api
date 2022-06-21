const express = require("express");
const router = express.Router();

const userController = require("./controllers/userController");

router
  .route("/web/card")
  .get(userController.webCard)
  .patch(userController.webFeed);

module.exports = router;
