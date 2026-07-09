const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    poemId: String,
    userId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Like", LikeSchema);