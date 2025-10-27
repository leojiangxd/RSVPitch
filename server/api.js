const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./schemas/User.js');
const Match = require('./schemas/Match.js');

router.post('/users/register', async (req, res) => {
  const { name, email, password, skillLevel, position } = req.body;
  try {
	// check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

	// hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

	// save user to db
    user = new User({ name, email, password: hashedPassword, skillLevel, position });
    await user.save();

	// remove password from the response
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
	// check for existing email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

	// compare hashes
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

	// remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ message: 'Login successful', user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/update/:id', async (req, res) => {
  try {
    const { email, oldPassword, newPassword, ...otherData } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      user.email = email;
    }

    // Update password
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect old password.' });
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

router.delete('/users/:id', async (req, res) => {
  try {
	// find user by id and delete
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
