const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./schemas/User.js");
const Match = require("./schemas/Match.js");
const WhitelistedToken = require("./schemas/WhitelistedToken.js");
const auth = require("./middleware/auth");

const TOKEN_EXPIRATION = 24 * 60 * 60; // 24 hours
const COOKIE_EXPIRATION_MS = TOKEN_EXPIRATION * 1000;

// users

router.post("/user/register", async (req, res) => {
  const { name, email, password, skillLevel, position } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User with that email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, skillLevel, position });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION }, (err, token) => {
      if (err) throw err;

      const expiresAt = new Date(Date.now() + COOKIE_EXPIRATION_MS);
      const whitelistedToken = new WhitelistedToken({ token, expiresAt });
      whitelistedToken.save().catch((e) => console.error("Whitelist save failed:", e));

      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: COOKIE_EXPIRATION_MS,
        })
        .status(201)
        .json({ user: userResponse });
    });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const userResponse = user.toObject();
    delete userResponse.password;

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION }, (err, token) => {
      if (err) throw err;

      const expiresAt = new Date(Date.now() + COOKIE_EXPIRATION_MS);
      const whitelistedToken = new WhitelistedToken({ token, expiresAt });
      whitelistedToken.save().catch((e) => console.error("Whitelist save failed:", e));

      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: COOKIE_EXPIRATION_MS,
        })
        .json({ user: userResponse });
    });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

router.post("/user/logout", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      await WhitelistedToken.deleteOne({ token }).catch((e) =>
        console.error("Whitelist delete failed:", e)
      );
    }

    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });
    return res.json({ message: "Logged out successfully." });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

router.put("/user/update", auth, async (req, res) => {
  try {
    const { email, oldPassword, newPassword, ...otherData } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = email;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect old password." });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    Object.assign(user, otherData);

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    return res.json(userResponse);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

router.delete("/user/delete", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ message: "User deleted successfully." });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: "Server error fetching user." });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: "Server error fetching user." });
  }
});

// matches

// normalize create payload from old/new field names
function normalizeMatchCreate(body, organizerId) {
  const { city, field, date, time, cityName, fieldName, startDateTime, maxPlayers, cleatsAllowed, tacklesAllowed } = body;

  const normalizedCity = cityName || city;
  const normalizedField = fieldName || field;

  let normalizedStart = startDateTime;
  if (!normalizedStart && date && time) normalizedStart = `${date}T${time}:00`;

  return {
    cityName: normalizedCity,
    fieldName: normalizedField,
    startDateTime: normalizedStart ? new Date(normalizedStart) : undefined,
    maxPlayers,
    cleatsAllowed: typeof cleatsAllowed === "boolean" ? cleatsAllowed : undefined,
    tacklesAllowed: typeof tacklesAllowed === "boolean" ? tacklesAllowed : undefined,
    organizer: organizerId,
    players: organizerId ? [organizerId] : [],
    team1: [],
    team2: [],
  };
}

// balancing helpers
function isGoalkeeperPosition(pos) {
  if (!pos) return false;
  const arr = Array.isArray(pos) ? pos : [pos];
  return arr.some((p) => {
    const s = String(p).toLowerCase().trim();
    return /\bgk\b/.test(s) || /\bgoal\s*keeper\b/.test(s) || /\bgoalie\b/.test(s) || /\bkeeper\b/.test(s);
  });
}

async function formBalancedTeams(userIds, capOverride) {
  const users = await User.find({ _id: { $in: userIds } })
    .select("skillLevel position name")
    .lean();

  const skillOf = (u) => (Number.isFinite(u.skillLevel) ? u.skillLevel : 0);
  const goalies = users.filter((u) => isGoalkeeperPosition(u.position));
  const rotationNeeded = goalies.length < 2;

  users.sort((a, b) => skillOf(b) - skillOf(a));

  const t1 = [], t2 = [];
  let t1Skill = 0, t2Skill = 0;

  if (goalies.length >= 2) {
    const sortedGoalies = [...goalies].sort((a, b) => skillOf(b) - skillOf(a));
    t1.push(sortedGoalies[0]._id.toString());
    t2.push(sortedGoalies[1]._id.toString());
    t1Skill += skillOf(sortedGoalies[0]);
    t2Skill += skillOf(sortedGoalies[1]);
  }

  const assigned = new Set([...t1, ...t2]);
  const cap = capOverride || Math.ceil(users.length / 2);

  for (const u of users) {
    const id = u._id.toString();
    if (assigned.has(id)) continue;

    if (t1.length >= cap) { t2.push(id); t2Skill += skillOf(u); assigned.add(id); continue; }
    if (t2.length >= cap) { t1.push(id); t1Skill += skillOf(u); assigned.add(id); continue; }

    if (t1Skill <= t2Skill) { t1.push(id); t1Skill += skillOf(u); }
    else { t2.push(id); t2Skill += skillOf(u); }
    assigned.add(id);
  }

  return { team1: t1, team2: t2, rotationNeeded };
}

// GK rotation helpers
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

async function teamHasNaturalGoalie(ids) {
  if (!ids || !ids.length) return false;
  const users = await User.find({ _id: { $in: ids } }).select("position").lean();
  return users.some((u) => isGoalkeeperPosition(u.position));
}

function ensureGKContainer(match) {
  if (!match.gkRotation) match.gkRotation = {};
  if (!match.gkRotation.team1) match.gkRotation.team1 = { active:false, rotationIntervalMinutes:15, lastRotatedAt:null, current:null, order:[], index:0 };
  if (!match.gkRotation.team2) match.gkRotation.team2 = { active:false, rotationIntervalMinutes:15, lastRotatedAt:null, current:null, order:[], index:0 };
}

async function initGKRotationForTeam(match, teamKey) {
  ensureGKContainer(match);
  const ids = (match[teamKey] || []).map((x) => x.toString());

  if (!ids.length) { match.gkRotation[teamKey] = { ...match.gkRotation[teamKey], active:false, current:null, order:[], index:0, lastRotatedAt:null }; return; }
  const hasGK = await teamHasNaturalGoalie(ids);

  if (hasGK) { match.gkRotation[teamKey] = { ...match.gkRotation[teamKey], active:false, current:null, order:[], index:0, lastRotatedAt:null, rotationIntervalMinutes:15 }; return; }
  const order = shuffleInPlace([].concat(ids));
  match.gkRotation[teamKey] = { active:true, rotationIntervalMinutes:15, lastRotatedAt:new Date(), current:order[0]||null, order, index: order.length>1?1:0 };
}

async function rotateGKsIfDue(match) {
  if (!match) return;
  ensureGKContainer(match);
  const now = Date.now();
  ["team1","team2"].forEach((teamKey) => {
    const rot = match.gkRotation[teamKey];

    if (!rot || !rot.active) return;
    const teamIds = (match[teamKey] || []).map((id) => id.toString());
    const teamSet = new Set(teamIds);

    if (teamSet.size === 0) { rot.active=false; rot.current=null; rot.order=[]; rot.index=0; rot.lastRotatedAt=null; return; }
    rot.order = (rot.order || []).filter((id) => teamSet.has(String(id)));

    if (!rot.order.length) { rot.order = shuffleInPlace([].concat(teamIds)); rot.index = 0; }
    if (rot.index >= rot.order.length) rot.index = 0;

    const intervalMs = ((rot.rotationIntervalMinutes || 15) * 60 * 1000) >>> 0;
    const last = rot.lastRotatedAt ? new Date(rot.lastRotatedAt).getTime() : 0;
    const due = !last || now - last >= intervalMs;
    const currentMissing = !rot.current || !teamSet.has(String(rot.current));

    if (due || currentMissing) {
      rot.current = rot.order[rot.index] || null;
      rot.index = (rot.index + 1) % rot.order.length;
      rot.lastRotatedAt = new Date(now);
    }
  });
  await match.save();
}

// ROUTES HERE

// GET a match. rotate lazily iff teams alr exist
router.get("/match/:id", async (req, res) => {
  try {
    const doc = await Match.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Match not found." });

    // only advance rotation if teams already formed (nonempty arrays)
    const teamsExist =
      Array.isArray(doc.team1) && doc.team1.length > 0 ||
      Array.isArray(doc.team2) && doc.team2.length > 0;

    if (teamsExist && doc.gkRotation && (
        (doc.gkRotation.team1 && doc.gkRotation.team1.active) ||
        (doc.gkRotation.team2 && doc.gkRotation.team2.active)
      )) {
      await rotateGKsIfDue(doc);
    }

    const match = await Match.findById(req.params.id)
      .populate({ path: "organizer", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" })
      .lean();

    return res.json(match);
  } catch (err) {
    console.error("GET /match/:id error:", err);
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});


// CREATE a match
router.post("/match/create", auth, async (req, res) => {
  try {
    const payload = normalizeMatchCreate(req.body, req.user.id);
    if (!payload.cityName || !payload.fieldName || !payload.startDateTime || !payload.maxPlayers) {
      return res.status(400).json({ message: "city, field, date, time, maxPlayers are required (or use cityName, fieldName, startDateTime)." });
    }

    const match = new Match(payload);
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "organizer", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" })
      .lean();

    return res.status(201).json(populated);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// DELETE a match
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
    return res.json({ message: "Match deleted successfully." });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// JOIN a match
router.post("/match/:id/join", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found." });

    const uid = req.user.id;
    if (match.players.some((p) => p.toString() === uid)) {
      return res.status(400).json({ message: "Already joined." });
    }

    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({ message: "Match is full." });
    }

    match.players.push(uid);
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "players", select: "name email skillLevel position" })
      .lean();

    return res.json({ message: "Joined match successfully.", match: populated });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// LEAVE a match
router.post("/match/:id/leave", auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found." });

    const uid = req.user.id;
    if (match.organizer.toString() === uid) {
      return res.status(400).json({ message: "Organizer cannot leave their own match." });
    }

    const before = match.players.length;
    match.players = match.players.filter((p) => p.toString() !== uid);
    if (before === match.players.length) {
      return res.status(400).json({ message: "You are not in this match." });
    }

    match.team1 = match.team1.filter((p) => p.toString() !== uid);
    match.team2 = match.team2.filter((p) => p.toString() !== uid);

    await match.save();
    return res.json({ message: "Left match successfully." });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// form teams
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

    const playerIds = match.players.map((p) => (p._id ? p._id : p));
    const cap = Math.ceil(match.maxPlayers / 2);
    const { team1, team2, rotationNeeded } = await formBalancedTeams(playerIds, cap);

    match.team1 = team1;
    match.team2 = team2;

    await initGKRotationForTeam(match, "team1");
    await initGKRotationForTeam(match, "team2");

    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: "team1", select: "name email skillLevel position" })
      .populate({ path: "team2", select: "name email skillLevel position" })
      .populate({ path: "players", select: "name email skillLevel position" })
      .populate({ path: "organizer", select: "name email skillLevel position" })
      .lean();

    return res.json({
      message: "Teams formed.",
      rotationNeeded,
      rotationNote: rotationNeeded
        ? "Not enough goalies for both teams. Rotate goalie every 15 minutes."
        : "One goalkeeper assigned per team.",
      match: populated,
    });
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// Search matches by city
router.get("/matches/search", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City query parameter is required." });

    const now = new Date();
    const matches = await Match.find({ cityName: new RegExp(city, "i") })
      .populate({ path: "organizer", select: "name" })
      .populate({ path: "players", select: "name" })
      .lean();

    const upcoming = [], pastOrOngoing = [];
    for (const m of matches) {
      if (new Date(m.startDateTime) > now) upcoming.push(m);
      else pastOrOngoing.push(m);
    }
    upcoming.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    pastOrOngoing.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    return res.json([...upcoming, ...pastOrOngoing]);
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ message: err.message });
  }
});

// GET the current user's created or joined matches (auth required)
router.get("/matches/my", auth, async (req, res) => {
  try {
    const uid = req.user.id;

    const matches = await Match.find({
      $or: [{ organizer: uid }, { players: uid }],
    })
      .populate({ path: "organizer", select: "name" })
      .populate({ path: "players", select: "name" })
      .lean();

    const now = new Date();
    const upcoming = [];
    const past = [];

    for (const m of matches) {
      if (new Date(m.startDateTime) >= now) upcoming.push(m);
      else past.push(m);
    }

    upcoming.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    past.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    res.json([...upcoming, ...past]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
