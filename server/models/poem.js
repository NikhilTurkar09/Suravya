const mongoose = require("mongoose");

const PoemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    ras: {
      type: String,
      default: "",
    },

    poem: {
      type: String,
      required: true,
    },

    poet: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    audio: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    // ==================== LIKES ====================

    likes: {
      type: Number,
      default: 0,
    },

    likedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ================= FAVORITES ===================

    favoritesCount: {
      type: Number,
      default: 0,
    },

    // ================= COMMENTS ====================

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        name: {
          type: String,
          required: true,
        },

        text: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },

        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },

            name: {
              type: String,
              required: true,
            },

            text: {
              type: String,
              required: true,
            },

            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],

    // ================= STATUS ======================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Poem", PoemSchema);