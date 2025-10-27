const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  skillLevel: {
    type: Number,
    min: 0,
    max: 4,
    required: [true, "Skill level is required"],
  },
  position: {
    type: [String],
    enum: ["goalie", "outfielder"],
    required: [true, "Position is required"],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "At least one position must be selected.",
    },
  },
});

module.exports = mongoose.model("User", userSchema);
