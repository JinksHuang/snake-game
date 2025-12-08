const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [courses] = await pool.query(
      'SELECT c.*, t.name as teacher_name FROM courses c LEFT JOIN teachers t ON c.teacher_id = t.id WHERE c.is_published = 1 ORDER BY c.is_recommended DESC, c.created_at DESC'
    );
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const [modules] = await pool.query('SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order ASC', [courseId]);
    const [lessons] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC', [courseId]);
    res.json({ course, modules, lessons });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/lessons/:lessonId', async (req, res, next) => {
  try {
    const { id: courseId, lessonId } = req.params;
    const header = req.headers.authorization;
    let userId = null;
    if (header) {
      try {
        const token = header.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = payload.id;
      } catch (e) {
        // ignore token error for preview
      }
    }
    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ? AND course_id = ?', [lessonId, courseId]);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    if (!lesson.is_preview) {
      if (!userId) return res.status(403).json({ message: 'Please purchase the course first' });
      const [[userCourse]] = await pool.query('SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      if (!userCourse) return res.status(403).json({ message: 'No permission to view this lesson' });
    }

    res.json(lesson);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
