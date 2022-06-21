require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

exports.webCard = async (req, res) => {
  // TODO: Get card data using userId and cardId
};

exports.webFeed = async (req, res) => {
  // TODO: Add feed to card from web using userId, cardId, name, and message
};
