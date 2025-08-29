const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    skill: { type: String, required: true },
    chapterTitle: { type: String, required: true },
    chapterDescription: { type: String, required: true },
     resources: [
      {
        type: { type: String, enum: ["note", "link", "video"], required: true },
        label: { type: String, required: true },
        content: { type: String, required: true }
      }
    ],
    lessonContent: { type: String, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
