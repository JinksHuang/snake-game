const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats/course/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[totalOrders]] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE course_id = ?', [id]);
    const [[paidOrders]] = await pool.query("SELECT COUNT(*) as total FROM orders WHERE course_id = ? AND status = 'PAID'", [id]);
    const [sourceBreakdown] = await pool.query(
      'SELECT source_lesson_id, COUNT(*) as total FROM orders WHERE course_id = ? GROUP BY source_lesson_id',
      [id]
    );
    res.json({ total_orders: totalOrders.total, paid_orders: paidOrders.total, source_breakdown: sourceBreakdown });
  } catch (err) {
    next(err);
  }
});

// Basic CRUD for courses (used by admin frontend)
router.get('/courses', async (req, res, next) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.post('/courses', async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      cover_url,
      description,
      price,
      promo_price,
      is_published,
      is_recommended,
      teacher_id,
    } = req.body;
    const [result] = await pool.query(
      'INSERT INTO courses (title, subtitle, cover_url, description, price, promo_price, is_published, is_recommended, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, cover_url, description, price, promo_price, is_published ? 1 : 0, is_recommended ? 1 : 0, teacher_id]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.put('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      cover_url,
      description,
      price,
      promo_price,
      is_published,
      is_recommended,
      teacher_id,
    } = req.body;
    await pool.query(
      'UPDATE courses SET title=?, subtitle=?, cover_url=?, description=?, price=?, promo_price=?, is_published=?, is_recommended=?, teacher_id=? WHERE id=?',
      [title, subtitle, cover_url, description, price, promo_price, is_published ? 1 : 0, is_recommended ? 1 : 0, teacher_id, id]
    );
    res.json({ message: 'updated' });
  } catch (err) {
    next(err);
  }
});

router.get('/courses/:courseId/modules', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const [modules] = await pool.query('SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order ASC', [courseId]);
    res.json(modules);
  } catch (err) {
    next(err);
  }
});

router.post('/courses/:courseId/modules', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, sort_order } = req.body;
    const [result] = await pool.query('INSERT INTO modules (course_id, title, sort_order) VALUES (?, ?, ?)', [courseId, title, sort_order || 0]);
    res.json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.post('/modules/:moduleId/lessons', async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { course_id, title, sort_order, video_url, content_richtext, is_preview, duration } = req.body;
    const [result] = await pool.query(
      'INSERT INTO lessons (module_id, course_id, title, sort_order, video_url, content_richtext, is_preview, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [moduleId, course_id, title, sort_order || 0, video_url, content_richtext, is_preview ? 1 : 0, duration]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.put('/lessons/:lessonId', async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { title, sort_order, video_url, content_richtext, is_preview, duration } = req.body;
    await pool.query(
      'UPDATE lessons SET title=?, sort_order=?, video_url=?, content_richtext=?, is_preview=?, duration=? WHERE id=?',
      [title, sort_order || 0, video_url, content_richtext, is_preview ? 1 : 0, duration, lessonId]
    );
    res.json({ message: 'lesson updated' });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      'SELECT o.*, c.title as course_title, u.openid FROM orders o LEFT JOIN courses c ON o.course_id = c.id LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
