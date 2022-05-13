const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: { type: ObjectId, required: true, ref: "book" },

    reviewedBy: { type: String, required: true, default: "Guest", trim: true },
    reviewedAt: { type: Date, required: true},
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
