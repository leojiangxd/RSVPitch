const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("./schemas/User.js");
const Match = require("./schemas/Match.js");
const WhitelistedToken = require("./schemas/WhitelistedToken.js"); // Import new model
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const TOKEN_EXPIRATION = 24 * 60 * 60; // 24 hours in seconds
const COOKIE_EXPIRATION_MS = TOKEN_EXPIRATION * 1000; // convert to milliseconds

router.post("/user/register", async (req, res) => {
  const { name, email, password, skillLevel, position } = req.body;
  try {
    // check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User with that email already exists." });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user to db
    user = new User({
      name,
      email,
      password: hashedPassword,
      skillLevel,
      position,
    });
    await user.save();

    // remove password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
      (err, token) => {
        if (err) throw err;

        // Add token to whitelist
        const expiresAt = new Date(Date.now() + COOKIE_EXPIRATION_MS);
        const whitelistedToken = new WhitelistedToken({ token, expiresAt });
        whitelistedToken.save().catch((saveErr) => {
          console.error("Failed to save token to whitelist:", saveErr);
        });

        // Set JWT as cookie
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: COOKIE_EXPIRATION_MS,
          })
          .status(201)
          .json({ user: userResponse });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // check for existing email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // compare hashes
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
      (err, token) => {
        if (err) throw err;

        // Add token to whitelist
        const expiresAt = new Date(Date.now() + COOKIE_EXPIRATION_MS);
        const whitelistedToken = new WhitelistedToken({ token, expiresAt });
        whitelistedToken.save().catch((saveErr) => {
          console.error("Failed to save token to whitelist:", saveErr);
        });

        // Set JWT as cookie
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: COOKIE_EXPIRATION_MS,
          })
          .json({ user: userResponse });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/user/logout", (req, res) => {
  try {
    // Remove token from whitelist
    const token = req.cookies.token;
    if (token)
      WhitelistedToken.deleteOne({ token }).catch((deleteErr) =>
        console.error("Failed to remove token from whitelist:", deleteErr)
      );

    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/user/update", auth, async (req, res) => {
  try {
    const { email, oldPassword, newPassword, ...otherData } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = email;
    }

    // Update password
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password." });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update other user data
    Object.assign(user, otherData);

    // Save changes
    const updatedUser = await user.save();

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/user/delete", auth, async (req, res) => {
  try {
    // find user by id and delete
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching user." });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching user." });
  }
});

module.exports = router;
