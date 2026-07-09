const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    userId: String,
    poemId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Favorite",
  FavoriteSchema
);