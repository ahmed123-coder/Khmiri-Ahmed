require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
require("./config/connect");

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts, try again later' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many messages sent' },
});

// Routes
const routerUser = require("./routes/user");
const routerProject = require("./routes/project");
const routerService = require("./routes/service");
const routerSite = require("./routes/contentsite");
const routerSections = require("./routes/sections");
const contactRouter = require("./routes/contactRouter");
const routerSkill = require("./routes/skill");

app.use("/api/user/login", loginLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/user", routerUser);
app.use("/api/project", routerProject);
app.use("/api/service", routerService);
app.use("/api/site", routerSite);
app.use("/api/site", routerSections);
app.use("/api/contact", contactRouter);
app.use("/api/skill", routerSkill);

// Health check or fallback
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});