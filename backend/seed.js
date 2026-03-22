require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("Admin user already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin1234", 10);
  await User.create({ username: "admin", password: hashedPassword, role: "admin" });

  console.log("Admin user created — username: admin | password: admin1234");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
