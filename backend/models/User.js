const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },

    // Social and portfolio links
    linkedIn: { type: String, default: "Not added" },
    github: { type: String, default: "Not added" },
    leetcode: { type: String, default: "Not added" },
    hackerrank: { type: String, default: "Not added" },
    skillrack: { type: String, default: "Not added" },
    portfolio: { type: String, default: "Not added" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
