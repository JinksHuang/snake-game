const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login-miniapp', async (req, res, next) => {
  try {
    const { code, nickname, avatar } = req.body;
    if (!code) return res.status(400).json({ message: 'code is required' });

    // Simulate exchanging code for openid
    const openid = `mock_openid_${code}`;

    const [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
    let userId;
    if (rows.length) {
      userId = rows[0].id;
      await pool.query('UPDATE users SET nickname=?, avatar=? WHERE id=?', [nickname || rows[0].nickname, avatar || rows[0].avatar, userId]);
    } else {
      const [result] = await pool.query('INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)', [openid, nickname || '新学员', avatar || '']);
      userId = result.insertId;
    }
    const token = jwt.sign({ id: userId, openid }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: userId, openid, nickname: nickname || rows?.[0]?.nickname || '新学员', avatar: avatar || rows?.[0]?.avatar || '' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
