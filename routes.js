const express = require("express");
const router = express.Router();

const userController = require("./controllers/userController");
const cardController = require("./controllers/cardController");

router.route("/user/code").post(userController.generateCode);
router.route("/user/validate").post(userController.validateCode);

router.route("/card").get(cardController.index).post(cardController.add);

router
  .route("/web/card")
  .get(cardController.webCard)
  .post(cardController.getShareToken)
  .patch(cardController.webFeed);

module.exports = router;
