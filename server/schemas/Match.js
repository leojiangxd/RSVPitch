const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: [true, "Field name is required"],
  },
  cityName: {
    type: String,
    required: [true, "City name is required"],
  },
  maxPlayers: {
    type: Number,
    min: [4, "A match must have at least 4 players"],
    required: [true, "Maximum players is required"],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Organizer is required"],
  },
  startDateTime: {
    type: Date,
    required: [true, "Start date and time is required"],
  },
  cleatsAllowed: {
    type: Boolean,
    default: false,
  },
  tacklesAllowed: {
    type: Boolean,
    default: false,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  team1: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  team2: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Rotating goalkeeper state (for teams without natural goalies)
  gkRotation: {
    team1: {
      active: { type: Boolean, default: false },
      rotationIntervalMinutes: { type: Number, default: 15 },
      lastRotatedAt: { type: Date },
      current: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      order: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      index: { type: Number, default: 0 }
    },
    team2: {
      active: { type: Boolean, default: false },
      rotationIntervalMinutes: { type: Number, default: 15 },
      lastRotatedAt: { type: Date },
      current: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      order: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      index: { type: Number, default: 0 }
    }
  }

});

module.exports = mongoose.model("Match", matchSchema);
