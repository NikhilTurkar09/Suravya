const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = require("./middleware/auth");
const admin = require("./middleware/admin");
const User = require("./models/User");
const Poem = require("./models/Poem");
const Comment = require("./models/Comment");
const Like = require("./models/Like");
const Favorite = require("./models/Favorite");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images and audio files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const poemUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]);

const profileUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

// Export for Part 2
module.exports = { app, auth, admin, poemUpload, profileUpload, User, Poem, Comment, Like, Favorite, bcrypt, jwt };

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ================= SYSTEM BASE ROUTE =================

app.get("/", (req, res) => {
  res.json({ message: "Suravya Backend Running 🚀" });
});

// ================= USER ROUTES =================

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
        bio: user.bio,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= POEMS ROUTES =================

app.post("/poems", auth, poemUpload, async (req, res) => {
  try {
    const poem = await Poem.create({
      title: req.body.title,
      category: req.body.category,
      ras: req.body.ras,
      poem: req.body.poem,
      poet: req.user.name,
      author: req.user.id,
      audio: req.files?.audio ? `/uploads/${req.files.audio[0].filename}` : "",
      coverImage: req.files?.coverImage
  ? `/uploads/${req.files.coverImage[0].filename}`
  : "/uploads/default-cover.jpeg",
      status: req.user.isAdmin ? "approved" : "pending",
    });

    if (req.user.isAdmin) {
      const followers = await User.find({ following: req.user.id });
      for (const follower of followers) {
        follower.notifications.unshift({
          message: `${req.user.name} uploaded a new poem`,
          link: `/writer/${req.user.name}`,
        });
        await follower.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: req.user.isAdmin ? "Poem published successfully ✅" : "Poem submitted for admin approval ⏳",
      poem,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/poems", async (req, res) => {
  try {
    const poems = await Poem.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(poems);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/poems/:id", async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });
    res.json({ success: true, poem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/my-poems", auth, async (req, res) => {
  try {
    const poems = await Poem.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, poems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/poems/:id", auth, poemUpload, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });

    if (!poem.author) poem.author = req.user.id;
    if (poem.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    poem.title = req.body.title || poem.title;
    poem.category = req.body.category || poem.category;
    poem.ras = req.body.ras || poem.ras;
    poem.poem = req.body.poem || poem.poem;

    if (req.body.removeCover === "true") poem.coverImage = "";
    if (req.body.removeAudio === "true") poem.audio = "";

    if (req.files?.coverImage?.[0]) poem.coverImage = "/uploads/" + req.files.coverImage[0].filename;
    if (req.files?.audio?.[0]) poem.audio = "/uploads/" + req.files.audio[0].filename;

    await poem.save();
    res.json({ success: true, message: "Poem Updated Successfully ✅", poem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/poems/:id", auth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem not found" });

    if (poem.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not Authorized" });
    }

    await Poem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Poem Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/poems/:id/like", auth, async (req, res) => {
  try {

    const alreadyLiked = await Like.findOne({
      poemId: req.params.id,
      userId: req.user.id,
    });

    // Unlike
    if (alreadyLiked) {

      await Like.deleteOne({
        _id: alreadyLiked._id,
      });

      const poem = await Poem.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: -1 } },
        { new: true }
      );

      return res.json({
        success: true,
        liked: false,
        message: "Poem Unliked",
        poem,
      });
    }

    // Like
    await Like.create({
      poemId: req.params.id,
      userId: req.user.id,
    });

    const poem = await Poem.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      liked: true,
      message: "Poem Liked",
      poem,
    });

  } catch (err) {res.status(500).json({success: false, message: err.message,});

  }
});

// ================= FOLLOW & SOCIALS ROUTES =================

app.post("/follow/:id", auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }
    const me = await User.findById(req.user.id);
    const writer = await User.findById(req.params.id);

    if (!writer) return res.status(404).json({ success: false, message: "Writer not found" });

    const already = me.following.includes(writer._id);
    if (already) {
      me.following.pull(writer._id);
      writer.followers.pull(me._id);
    } else {
      me.following.push(writer._id);
      writer.followers.push(me._id);
    }

    await me.save();
    await writer.save();
    res.json({ success: true, following: !already });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/following", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).populate("following", "name avatar bio");
    res.json({ success: true, users: me.following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/followers/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name avatar bio");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, users: user.followers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/following/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name avatar bio");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, users: user.following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= SEARCH & AGGREGATIONS =================

app.get("/search", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    let filter = { status: "approved" };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { poet: { $regex: q, $options: "i" } },
        { poem: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "All") filter.category = category;

    if (sort === "trending") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filter.createdAt = { $gte: oneWeekAgo };

      let poems = await Poem.find(filter);
      poems = await Promise.all(
        poems.map(async (poem) => {
          const favoritesCount = await Favorite.countDocuments({ poemId: poem._id });
          const commentsCount = poem.comments?.length || 0;
          const daysOld = (Date.now() - new Date(poem.createdAt)) / (1000 * 60 * 60 * 24);
          const recentBonus = Math.max(0, 7 - daysOld);
          const score = (poem.likes || 0) * 5 + commentsCount * 3 + favoritesCount * 4 + recentBonus;

          return { ...poem.toObject(), score };
        })
      );

      poems.sort((a, b) => b.score - a.score);
      return res.json({ success: true, poems: poems.slice(0, 9) });
    }

    let query = Poem.find(filter);
    if (sort === "oldest") query = query.sort({ createdAt: 1 });
    else if (sort === "likes") query = query.sort({ likes: -1 });
    else query = query.sort({ createdAt: -1 });

    const poems = await query;
    res.json({ success: true, poems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/top-writers", async (req, res) => {
  try {
    const topWriters = await Poem.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$author",
          poemCount: { $sum: 1 },
          totalLikes: { $sum: { $ifNull: ["$likes", 0] } },
          totalFavorites: { $sum: { $ifNull: ["$favoritesCount", 0] } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      { $unwind: "$authorDetails" },
      {
        $project: {
          _id: 1,
          name: "$authorDetails.name",
          avatar: "$authorDetails.avatar",
          poemCount: 1,
          likes: "$totalLikes",
          followersCount: { $size: { $ifNull: ["$authorDetails.followers", []] } },
          score: {
            $add: [
              "$totalLikes",
              "$poemCount",
              "$totalFavorites",
              { $size: { $ifNull: ["$authorDetails.followers", []] } }
            ]
          }
        }
      },
      { $sort: { score: -1 } }
    ]);

    res.json({ 
      success: true, 
      writers: topWriters.slice(0, 10) 
    });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= PROFILE ROUTES =================

app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const poems = await Poem.find({ author: user._id, status: "approved" }).sort({ createdAt: -1 });
    const totalLikes = poems.reduce((sum, p) => sum + (p.likes || 0), 0);

    res.json({
      success: true,
      user,
      poems,
      stats: { poems: poems.length, likes: totalLikes },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/profile", auth, profileUpload, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User Not Found" });

    if (name && name.trim() !== "") user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (req.files?.avatar) user.avatar = "/uploads/" + req.files.avatar[0].filename;
    if (req.files?.cover) user.cover = "/uploads/" + req.files.cover[0].filename;

    await user.save();
    await Poem.updateMany({ author: user._id }, { $set: { poet: user.name } });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/writer/:name", auth, async (req, res) => {
  try {
    const writerName = decodeURIComponent(req.params.name).trim();
    const user = await User.findOne({ name: { $regex: new RegExp(`^${writerName}$`, "i") } })
      .populate("followers", "name avatar")
      .populate("following", "name avatar");

    if (!user) return res.status(404).json({ success: false, message: "User Not Found" });

    const poems = await Poem.find({ author: user._id, status: "approved" }).sort({ createdAt: -1 });
    const totalLikes = poems.reduce((sum, p) => sum + (p.likes || 0), 0);
    const isFollowing = user.followers.some((f) => f._id.toString() === req.user.id);

    res.json({
      success: true,
      writer: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar || "",
        cover: user.cover || "",
        bio: user.bio || "",
        joined: user.createdAt,
        followers: user.followers,
        following: user.following,
      },
      stats: { poems: poems.length, likes: totalLikes },
      poems,
      isFollowing,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= FAVORITES ROUTES =================
app.put("/favorites/:id", auth, async (req, res) => {
  try {

    const poem = await Poem.findById(req.params.id);

    if (!poem) {
      return res.status(404).json({
        success: false,
        message: "Poem not found",
      });
    }
    const fav = await Favorite.findOne({
      userId: req.user.id,
      poemId: req.params.id,
    });
    if (fav) {
      await Favorite.findByIdAndDelete(fav._id);
      poem.favoritesCount = Math.max(
        (poem.favoritesCount || 0) - 1,
        0
      );
      await poem.save();
      return res.json({
        success: true,
        favorite: false,
        favoritesCount: poem.favoritesCount,
        message: "❌Removed from Favorites❌",
      });
    }
    await Favorite.create({
      userId: req.user.id,
      poemId: req.params.id,
    });
    poem.favoritesCount =
      (poem.favoritesCount || 0) + 1;
    await poem.save();
    return res.json({
      success: true,
      favorite: true,
      favoritesCount: poem.favoritesCount,
      message: "💚Added to Favorites💚",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

app.get("/favorites", auth, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id });
    const ids = favs.map((f) => f.poemId);
    const poems = await Poem.find({ _id: { $in: ids } });
    res.json({ success: true, poems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/favorites/check/:id", auth, async (req, res) => {
  try {
    const fav = await Favorite.findOne({ userId: req.user.id, poemId: req.params.id });
    res.json({ success: true, favorite: !!fav });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= COMMENTS & REPLIES =================

app.post("/poem/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });

    poem.comments.unshift({ user: req.user.id, name: req.user.name, text });
    await poem.save();

    const author = await User.findById(poem.author);
    if (author && author._id.toString() !== req.user.id) {
      author.notifications.unshift({
        message: `${req.user.name} commented on your poem`,
        link: `/poem/${poem._id}`,
      });
      await author.save();
    }

    res.json({ success: true, message: "Comment Added", comments: poem.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/poem/:poemId/comment/:commentId", auth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.poemId);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });

    const comment = poem.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment Not Found" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not Allowed" });
    }

    comment.deleteOne();
    await poem.save();
    res.json({ success: true, message: "Comment Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/poem/:poemId/reply/:commentId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const poem = await Poem.findById(req.params.poemId);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });

    const comment = poem.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment Not Found" });

    comment.replies.push({ user: req.user.id, name: req.user.name, text });
    await poem.save();

    const commentOwner = await User.findById(comment.user);
    if (commentOwner && commentOwner._id.toString() !== req.user.id) {
      commentOwner.notifications.unshift({
        message: `${req.user.name} replied to your comment`,
        link: `/poem/${poem._id}`,
      });
      await commentOwner.save();
    }

    res.json({ success: true, message: "Reply Added", replies: comment.replies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/poem/:poemId/reply/:commentId/:replyId", auth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.poemId);
    if (!poem) return res.status(404).json({ success: false, message: "Poem Not Found" });

    const comment = poem.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment Not Found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: "Reply Not Found" });

    if (reply.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not Allowed" });
    }

    reply.deleteOne();
    await poem.save();
    res.json({ success: true, message: "Reply Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= NOTIFICATIONS ROUTES =================

app.get("/notifications", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, notifications: user.notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/notifications/read/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) return res.status(404).json({ success: false, message: "Notification Not Found" });

    notification.isRead = true;
    await user.save();
    res.json({ success: true, message: "Notification Marked Read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/notifications/read-all", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notifications.forEach((n) => (n.isRead = true));
    await user.save();
    res.json({ success: true, message: "All Notifications Read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/notifications/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notifications.pull(req.params.id);
    await user.save();
    res.json({ success: true, message: "Notification Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= ADMIN PANELS =================

app.get("/admin/pending", auth, admin, async (req, res) => {
  try {
    const poems = await Poem.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, poems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/admin/approve/:id", auth, admin, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem not found" });

    poem.status = "approved";
    poem.reviewMessage = "";
    await poem.save();

    const author = await User.findById(poem.author);
    if (author) {
      const followers = await User.find({ following: author._id });
      for (const follower of followers) {
        follower.notifications.unshift({
          message: `${author.name} uploaded a new poem`,
          link: `/writer/${author.name}`,
        });
        await follower.save();
      }
    }

    res.json({ success: true, message: "Poem Approved Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/admin/reject/:id", auth, admin, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ success: false, message: "Poem not found" });

    poem.status = "rejected";
    poem.reviewMessage = req.body.reason || req.body.message || "";
    await poem.save();

    res.json({ success: true, message: "Poem Rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/admin/dashboard", auth, admin, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const poems = await Poem.countDocuments();
    const pending = await Poem.countDocuments({ status: "pending" });
    const approved = await Poem.countDocuments({ status: "approved" });
    const rejected = await Poem.countDocuments({ status: "rejected" });

    const likes = await Poem.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ["$likes", 0] } } } }
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentPoems = await Poem.find().sort({ createdAt: -1 }).limit(5);
    const pendingPoems = await Poem.find({ status: "pending" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: { users, poems, pending, approved, rejected, totalLikes: likes[0]?.total || 0 },
      recentUsers,
      recentPoems,
      pendingPoems,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= SYSTEM REPAIR DATA SCRIPTS =================

app.get("/fix-authors", async (req, res) => {
  try {
    const users = await User.find();
    for (const user of users) {
      await Poem.updateMany(
        { poet: user.name, author: { $exists: false } },
        { $set: { author: user._id } }
      );
    }
    res.send("Authors Fixed Successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ================= FINAL SERVER INITIALIZATION =================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});