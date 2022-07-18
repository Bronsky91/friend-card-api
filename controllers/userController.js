require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const seedrandom = require("seedrandom");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

exports.generateCode = async (req, res) => {
  try {
    const { number, name } = req.body;

    // Find or create user
    let user = await User.findOne({ number });
    if (!user) {
      user = new User();
      user.number = number;
      user.name = name;
    }

    const rng = seedrandom(crypto.randomBytes(64).toString("base64"), {
      entropy: true,
    });
    const code = rng().toString().substring(3, 7);

    user.authCode = code;

    await user.save();

    twilioClient.messages.create({
      body: `Your Friend Card code is: ${code}`,
      from: "+14155733922",
      to: number,
    });

    return res.json({ code });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.validateCode = async (req, res) => {
  try {
    const { code } = req.body;

    // Retrieve user from code, if user found logged in, otherwise send 401
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

    return res.json({ user, token });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
