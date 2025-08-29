const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }], // linked chapters
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }], // linked lessons
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", moduleSchema);
