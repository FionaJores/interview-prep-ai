const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    chapterTitle: { type: String, required: true },
    chapterDescription: { type: String, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
