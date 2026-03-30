const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Skill = require('../models/skill');
const User = require('../models/user');

const JWT_SECRET = 'your_secret_key';

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(skill);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
