const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/courses', auth, async (req, res, next) => {
  try {
    const [courses] = await pool.query(
      'SELECT c.*, uc.created_at as purchased_at FROM user_courses uc LEFT JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = ?',
      [req.user.id]
    );
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.get('/courses/:courseId/progress', auth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const [[progress]] = await pool.query('SELECT * FROM learning_progress WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
    const [[countRow]] = await pool.query('SELECT COUNT(*) as total FROM lessons WHERE course_id = ?', [courseId]);
    res.json({ progress: progress || null, total_lessons: countRow.total });
  } catch (err) {
    next(err);
  }
});

router.post('/courses/:courseId/progress', auth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { last_lesson_id, completed_lessons_count } = req.body;
    await pool.query(
      'INSERT INTO learning_progress (user_id, course_id, last_lesson_id, completed_lessons_count) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE last_lesson_id = VALUES(last_lesson_id), completed_lessons_count = VALUES(completed_lessons_count), last_visit_time = NOW()',
      [req.user.id, courseId, last_lesson_id || null, completed_lessons_count || 0]
    );
    res.json({ message: 'progress saved' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
