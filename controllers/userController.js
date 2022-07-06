require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const seedrandom = require("seedrandom");

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

exports.generateCode = async (req, res) => {
  try {
    const { number } = req.body;

    // Find or create user
    let user = await User.findOne({ number });
    if (!user) {
      user = new User();
      user.number = number;
    }

    if (process.env.DEV) {
      res.json({ user });
    }

    const rng = seedrandom(crypto.randomBytes(64).toString("base64"), {
      entropy: true,
    });
    const code = rng().toString().substring(3, 7);

    console.log(`AUTH CODE FOR DEBUGGING`, code);

    user.authCode = code;

    // TODO: Implement Twilio integration
    //* Send code to phone number entered

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.validateCode = async (req, res) => {
  try {
    const { code } = req.body;

    // TODO: Retrieve user from code, if user found logged in, otherwise send 401
    const user = await User.findOne({ authCode: code });

    if (!user) {
      return res.sendStatus(401);
    }

    const token = jwt.sign(
      {
        id: user._id,
        number: user.number,
      },
      jwtSecret
    );

    delete user.authCode;
    user.token = token;

    return res.json({ user });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
