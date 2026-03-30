require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
require("./config/connect");

// Routes
const routerUser = require("./routes/user");
const routerProject = require("./routes/project");
const routerService = require("./routes/service");
const routerSite = require("./routes/contentsite");
const contactRouter = require("./routes/contactRouter");
const routerSkill = require("./routes/skill");

app.use("/api/user", routerUser);
app.use("/api/project", routerProject);
app.use("/api/service", routerService);
app.use("/api/site", routerSite);
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