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

router.post("/user/logout", async (req, res) => {
  try {
    // Remove token from whitelist
    const token = req.cookies.token;
    if (token)
      await WhitelistedToken.deleteOne({ token }).catch((deleteErr) =>
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

// ========================= Match routes =========================

// Helper: convert various input shapes to schema fields
function normalizeMatchCreate(body, organizerId) {
  const {
    // old client names:
    city, field, date, time,
    // new schema names:
    cityName, fieldName, startDateTime,
    maxPlayers, rules, cleatsAllowed, tacklesAllowed
  } = body;

  const normalizedCity = cityName || city;
  const normalizedField = fieldName || field;

  let normalizedStart = startDateTime;
  if (!normalizedStart && date && time) {
    // Build ISO datetime from date & time
    normalizedStart = `${date}T${time}:00`;
  }

  return {
    cityName: normalizedCity,
    fieldName: normalizedField,
    startDateTime: normalizedStart ? new Date(normalizedStart) : undefined,
    maxPlayers,
    // store optional flags if present; you can add `rules` to schema later if desired
    cleatsAllowed: typeof cleatsAllowed === "boolean" ? cleatsAllowed : undefined,
    tacklesAllowed: typeof tacklesAllowed === "boolean" ? tacklesAllowed : undefined,
    organizer: organizerId,
    players: organizerId ? [organizerId] : [],
    team1: [],
    team2: [],
  };
}

// Helper: balance by total skill (with goalie split + size cap)
async function formBalancedTeams(userIds) {
  // Pull users with skill/position
  const users = await User.find({ _id: { $in: userIds } })
    .select("skillLevel position name")
    .lean();

  const skillOf = (u) => (Number.isFinite(u.skillLevel) ? u.skillLevel : 0);
  const isGoalie = (u) => Array.isArray(u.position) && u.position.includes("goalie");

  const goalies = users.filter(isGoalie);
  const rotationNeeded = goalies.length < 2;

  // Sort by skill desc (highest first)
  users.sort((a, b) => skillOf(b) - skillOf(a));

  const t1 = [];
  const t2 = [];
  let t1Skill = 0;
  let t2Skill = 0;

  // If we have at least 2 goalies, put the top 2 on separate teams
  if (goalies.length >= 2) {
    const sortedGoalies = [...goalies].sort((a, b) => skillOf(b) - skillOf(a));
    t1.push(sortedGoalies[0]._id.toString());
    t2.push(sortedGoalies[1]._id.toString());
    t1Skill += skillOf(sortedGoalies[0]);
    t2Skill += skillOf(sortedGoalies[1]);
  }

  // Assign remaining players (highest first) to the team with LOWER total skill
  const assigned = new Set([...t1, ...t2]);
  const cap = Math.ceil(users.length / 2); // keep team sizes within 1

  for (const u of users) {
    const id = u._id.toString();
    if (assigned.has(id)) continue;

    // If one team hit the cap, force onto the other
    if (t1.length >= cap) {
      t2.push(id);
      t2Skill += skillOf(u);
      assigned.add(id);
      continue;
    }
    if (t2.length >= cap) {
      t1.push(id);
      t1Skill += skillOf(u);
      assigned.add(id);
      continue;
    }

    // Main balancing: lower total skill takes the next best player
    if (t1Skill <= t2Skill) {
      t1.push(id);
      t1Skill += skillOf(u);
    } else {
      t2.push(id);
      t2Skill += skillOf(u);
    }
    assigned.add(id);
  }

  return { team1: t1, team2: t2, rotationNeeded };
}



// GET a match (public)
router.get("/match/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({ path: "organizer", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" });

    if (!match) return res.status(404).json({ message: "Match not found." });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a match (auth required)
router.post("/match/create", auth, async (req, res) => {
  try {
    const payload = normalizeMatchCreate(req.body, req.user.id);

    if (!payload.cityName || !payload.fieldName || !payload.startDateTime || !payload.maxPlayers) {
      return res.status(400).json({
        message:
          "city, field, date, time, maxPlayers are required (or use cityName, fieldName, startDateTime).",
      });
    }

    const match = new Match(payload);
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "organizer", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a match (organizer only)
router.delete("/match/delete", auth, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Match id (id) is required." });

    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ message: "Match not found." });

    if (match.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the organizer can delete this match." });
    }

    await Match.findByIdAndDelete(id);
    res.json({ message: "Match deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// JOIN a match (auth required)
router.post("/match/:id/join", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found." });

    // already in?
    const uid = req.user.id;
    const already = match.players.some((p) => p.toString() === uid);
    if (already) return res.status(400).json({ message: "Already joined." });

    // capacity check
    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({ message: "Match is full." });
    }

    match.players.push(uid);
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "players", select: "name email skillLevel position" });

    res.json({ message: "Joined match successfully.", match: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LEAVE a match (auth required)
router.post("/match/:id/leave", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found." });

    const uid = req.user.id;
    // organizer cannot leave (or you can transfer ownership as an enhancement)
    if (match.organizer.toString() === uid) {
      return res.status(400).json({ message: "Organizer cannot leave their own match." });
    }

    const before = match.players.length;
    match.players = match.players.filter((p) => p.toString() !== uid);
    const after = match.players.length;

    if (before === after) return res.status(400).json({ message: "You are not in this match." });

    // also remove from teams
    match.team1 = match.team1.filter((p) => p.toString() !== uid);
    match.team2 = match.team2.filter((p) => p.toString() !== uid);

    await match.save();
    res.json({ message: "Left match successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FORM TEAMS (organizer only)
router.post("/match/:id/form-teams", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("players", "skillLevel position");
    if (!match) return res.status(404).json({ message: "Match not found." });

    if (match.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the organizer can form teams." });
    }

    if (!match.players || match.players.length < 2) {
      return res.status(400).json({ message: "Need at least 2 players to form teams." });
    }

    const playerIds = match.players.map((p) => p._id ? p._id : p);
    const cap = Math.ceil(match.maxPlayers / 2);
    const { team1, team2, rotationNeeded } = await formBalancedTeams(playerIds, cap);


    match.team1 = team1;
    match.team2 = team2;
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "organizer", select: "name email skillLevel position" });

    res.json({
      message: "Teams formed.",
      rotationNeeded,
      rotationNote: rotationNeeded
        ? "Not enough goalies for both teams. Rotate goalie every 15 minutes."
        : "One goalkeeper assigned per team.",
      match: populated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/matches/search", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "City query parameter is required." });
    }

    const now = new Date();
    const matches = await Match.find({ cityName: new RegExp(city, "i") })
      .populate({ path: "organizer", select: "name" })
      .populate({ path: "players", select: "name" })
      .lean();

    const upcomingGames = [];
    const pastOrOngoingGames = [];

    for (const match of matches) {
      if (new Date(match.startDateTime) > now) {
        upcomingGames.push(match);
      } else {
        pastOrOngoingGames.push(match);
      }
    }

    upcomingGames.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    pastOrOngoingGames.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    res.json([...upcomingGames, ...pastOrOngoingGames]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;