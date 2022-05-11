const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: { type: ObjectId, required: true, ref: "Books" },

    reviewedBy: { type: String, required: true, default: "Guest", trim: true },
    reviewedAt: { type: Date, immutable: true, default: () => Date.now() },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
