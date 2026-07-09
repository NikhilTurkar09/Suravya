const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    console.log("JWT USER =", req.user);

    const user = await User.findById(req.user.id);

    console.log("DB USER =", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("DB isAdmin =", user.isAdmin);

    if (user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: "Admin Only",
      });
    }

    next();
  } catch (err) {
    console.log("ADMIN MIDDLEWARE ERROR =", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};