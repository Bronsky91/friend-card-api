require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

exports.new = async (req, res) => {
  // TODO: Implement Twilio integration
  try {
    const user = new User();
    const { number, name, email, about } = req.body;

    user.number = number;
    user.email = email;
    user.name = name;
    user.about = about;
    // authCode

    const newUser = await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        type: "user",
      },
      jwtSecret
    );

    return res.json({ token, user: newUser });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).send({ error: "User already exists" });
    }
    throw error;
  }
};
