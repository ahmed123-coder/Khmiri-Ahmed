const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySuperSecretKey";

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username }); // Use findOne instead of find
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password); // Fixed typo: campare → compare
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const payload = { id: user._id, role: user.role }; // Fixed typo: pyload → payload
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

// Register route
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username }); // Use findOne instead of find
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

// Get all users (admin only)
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin
    if (user.role === "admin") {
      const users = await User.find();
      res.status(200).json(users);
    } else {
      res.status(403).json({ message: "Only admins can access this route" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/sidebaradmin", async (req, res)=>{
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  }catch(err){
    res.status(500).json({error: err.message});
  }
});
// Delete user (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin
    if (user.role === "admin") {
      const userId = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(403).json({ message: "Only admins can delete users" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update user (admin only)
router.put("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      const { username, password, role } = req.body;
      const editUser = await User.findById(req.params.id);
      if (!editUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (username) editUser.username = username;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        editUser.password = hashedPassword;
      }
      editUser.role = role;
      await editUser.save();
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(403).json({ message: "Only admins can update users" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});
module.exports = router;