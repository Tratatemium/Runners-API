const mongoose = require("mongoose");

const RunSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationSec: {
      type: Number,
      required: true,
      min: 0,
    },
    distanceMeters: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Optional compound index for user + startTime queries
RunSchema.index({ userId: 1, startTime: -1 });

module.exports = mongoose.model("Run", RunSchema);