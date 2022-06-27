const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  authCode: { type: Number },
  name: { type: String },
  email: { type: String },
  about: { type: String },
  //   accounts: [],
  //   photos: [],
  cards: [
    {
      title: String,
      location: {
        address: String,
        latitude: Number,
        longitude: Number,
      },
      description: String,
      date: String,
      slots: Number,
      attendees: Number,
      startTime: String,
      endTime: String,
      media: [String],
      isPublic: Boolean,
      shareNumber: Boolean,
      feed: [
        {
          timestamp: Number,
          name: String,
          message: String,
        },
      ],
    },
  ],
  requests: [
    {
      status: String,
      message: String,
      profile: {
        userId: String,
        name: String,
        number: Number,
        picture: String,
      },
      card: {
        cardId: String,
        title: String,
        date: String,
        startTime: String,
        attendees: Number,
      },
    },
  ],
});

var User = (module.exports = mongoose.model("user", userModel));

module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit);
};
