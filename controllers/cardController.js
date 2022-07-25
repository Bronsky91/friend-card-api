require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const jwtSecret = process.env.JWT_SECRET;

const TEST_IMAGE = `https://media-exp1.licdn.com/dms/image/C5603AQFAlhYbbU6Deg/profile-displayphoto-shrink_200_200/0/1623190408090?e=2147483647&v=beta&t=D34_RLLDyIxYssFQRy4lPRQT5XYeJ4Ftk9QwBZtwVVI`;

exports.index = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");
    const tokenData = jwt.verify(token, jwtSecret);

    const user = await User.findById(tokenData.id);

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

    const user = await User.findById(tokenData.id);

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

// exports.edit = async (req, res) => {
//   try {
//     const [bearer, token] = req.headers.authorization.split(" ");

//     const { card } = req.body;

//     if (!card) {
//       return res.status(400).send({ error: "No card was added" });
//     }
//     const tokenData = jwt.verify(token, jwtSecret);

//     const user = await User.findById(tokenData.id);

//     const cardToEdit = user.cards.find((c) => c._id.equals(card._id));

//     if (cardToEdit) {
//       await User.updateOne(
//         { _id: tokenData.id },
//         {
//           $set: {
//             "cards.$[c].favorited": card.favorited,
//             "cards.$[c].watched": card.watched,
//             "cards.$[c].rating": card.rating,
//           },
//         },
//         {
//           arrayFilters: [{ "c._id": cardToEdit._id }],
//         }
//       );
//       const editedUser = await User.findOne({ _id: tokenData.id });

//       const editedShow = editedUser.show_list.find((s) =>
//         s._id.equals(showToEdit._id)
//       );

//       res.status(200).send({ show: editedShow });
//     } else {
//       res.status(400).send({ error: `Show ${show._id} does not exist` });
//     }
//   } catch (error) {
//     console.log(error);
//     if (error.name === "JsonWebTokenError") {
//       res.sendStatus(401); // 401 is unathorized and should log the user out on the client
//     } else {
//       console.log(error.message);
//       res.status(400).send({ error: error.message });
//     }
//   }
// };

exports.remove = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");

    const { card } = req.body;

    const tokenData = jwt.verify(token, jwtSecret);

    const user = await User.findById(tokenData.id);

    const cardToRemove = user.cards.find((c) => c._id.equals(card._id));

    if (cardToRemove) {
      await user.cards.pull({ _id: cardToRemove._id });
      await user.save();

      res.status(200).send({ msg: "Card removed", id: card.id });
    } else {
      res.status(400).send({ error: `Card ${card.id} does not exist` });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.sendStatus(401); // 401 is unathorized and should log the user out on the client
    } else {
      console.log(error.message);
      res.status(400).send({ error: error.message });
    }
  }
};

exports.getShareToken = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");
    const tokenData = jwt.verify(token, jwtSecret);

    const { cardId } = req.body;

    const user = await User.findById(tokenData.id);

    const shareToken = jwt.sign(
      {
        userId: user._id,
        cardId,
      },
      jwtSecret
    );

    res.json({ token: shareToken });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.sendStatus(401); // 401 is unauthorized and should log the user out on the client
    } else {
      res.status(400).send({ error });
    }
  }
};

exports.feed = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");

    const { cardId, message } = req.body;

    if (!message) {
      return res.status(400).send({ error: "Message is required" });
    }

    const tokenData = jwt.verify(token, jwtSecret);

    const user = await User.findById(tokenData.id);
    const card = user.cards.find((c) => c._id.equals(cardId));

    const timestamp = new Date().getTime();

    await card.feed.push({
      timestamp,
      name: user.name,
      message,
    });
    await user.save();

    const updatedCard = user.cards.find((c) => c._id.equals(cardId));
    const feed = updatedCard.feed;

    res.json({ feed });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

exports.webCard = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");

    const { userId, cardId } = jwt.verify(token, jwtSecret);

    const user = await User.findById(userId);
    const card = user.cards.find((c) => c._id.equals(cardId));

    res.json({ card, profile: { name: user.name, image: TEST_IMAGE } });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

exports.webFeed = async (req, res) => {
  try {
    const [bearer, token] = req.headers.authorization.split(" ");

    const { userId, cardId } = jwt.verify(token, jwtSecret);
    const { name, message } = req.body;

    console.log(userId);
    console.log(cardId);
    if (!message) {
      return res.status(400).send({ error: "Message is required" });
    }

    const user = await User.findById(userId);
    const card = user.cards.find((c) => c._id.equals(cardId));

    const timestamp = new Date().getTime();

    await card.feed.push({
      timestamp,
      name: name || "Anonymous",
      message,
    });
    await user.save();

    const updatedCard = user.cards.find((c) => c._id.equals(cardId));
    const feed = updatedCard.feed;

    res.json({ feed });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
