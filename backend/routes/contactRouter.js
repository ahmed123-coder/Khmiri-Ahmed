const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

router.post("/", async (req, res) => {
  const { name, email, message, to , pass, user} = req.body;

  if (!name || !email || !message || !to) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // إعداد SMTP لنقل البريد
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user, // بريدك
        pass: pass, // كلمة المرور الخاصة بالبريد
      },
    });

    // إعداد محتوى البريد
    const mailOptions = {
      from: user,
      to: to, // Use the contactEmail passed from the frontend
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
});

module.exports = router;