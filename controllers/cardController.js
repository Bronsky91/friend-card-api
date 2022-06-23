require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

exports.index = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");
    const tokenData = jwt.verify(token, jwtSecret);

    const user = await User.findById(tokenData._id);

    res.json({ cards: user.cards });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.sendStatus(401); // 401 is unathorized and should log the user out on the client
    } else {
      res.status(400).send({ error });
    }
  }
};

exports.add = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");

    const { card } = req.body;

    if (!card) {
      return res.status(400).send({ error: "No card was added" });
    }
    const tokenData = jwt.verify(token, jwtSecret);

    const user = await User.findById(tokenData._id);

    const newCardId = new mongoose.Types.ObjectId();

    await user.cards.push({ _id: newCardId, ...card });
    await user.save();

    const newCard = user.cards.find((c) => c._id.equals(newCardId));

    res.status(200).send({ card: newCard });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.sendStatus(401); // 401 is unathorized and should log the user out on the client
    } else {
      res.status(400).send({ error: error?.message });
    }
  }
};

exports.webCard = async (req, res) => {
  // TODO: Get card data using userId and cardId
  try {
    const { userId, cardId } = req.query;

    const user = await User.findById(userId);
    const card = user.cards.find((c) => c._id.equals(cardId));

    res.json({ card, profile: { name: user.name } });
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.webFeed = async (req, res) => {
  // TODO: Add feed to card from web using userId, cardId, name, and message
  try {
    const { userId, cardId, name, message } = req.query;

    const user = await User.findById(userId);
    const card = user.cards.find((c) => c._id.equals(cardId));

    // TODO: add a new message object to the feed array with a timestamp and return the entire feed

    const timestamp = new Date().getTime();

    // Does this actually work?
    await card.feed.push({
      timestamp,
      name,
      message,
    });
    await user.save();

    const updatedCard = user.cards.find((c) => c._id.equals(cardId)); // Needed?
    const feed = updatedCard.feed;

    res.json({ feed });
  } catch (error) {
    res.status(400).send({ error });
  }
};
