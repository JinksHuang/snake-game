const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const { course_id, source_lesson_id } = req.body;
    if (!course_id) return res.status(400).json({ message: 'course_id required' });
    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ?', [course_id]);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const price = course.promo_price || course.price;
    const orderNo = uuidv4().replace(/-/g, '');
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, course_id, order_no, total_price, status, source_lesson_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, course_id, orderNo, price, 'PENDING', source_lesson_id || null]
    );
    res.json({ order_id: result.insertId, order_no: orderNo, total_price: price, course });
  } catch (err) {
    next(err);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      'SELECT o.*, c.title as course_title FROM orders o LEFT JOIN courses c ON o.course_id = c.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
