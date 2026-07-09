const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    poemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poem",
    },

    user: String,

    text: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", CommentSchema);