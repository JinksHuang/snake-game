require('dotenv').config({ path: '../server/.env' });
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;
const API_BASE = process.env.ADMIN_API_BASE || 'http://localhost:3001';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.JWT_SECRET || 'admin_session',
    resave: false,
    saveUninitialized: true,
  })
);

function ensureLogin(req, res, next) {
  if (req.session?.authed) return next();
  return res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.authed = true;
    return res.redirect('/courses');
  }
  res.render('login', { error: '账号或密码错误' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/', ensureLogin, (req, res) => res.redirect('/courses'));

app.get('/courses', ensureLogin, async (req, res) => {
  const { data } = await axios.get(`${API_BASE}/admin/courses`);
  res.render('courses', { courses: data });
});

app.get('/courses/new', ensureLogin, (req, res) => {
  res.render('course_form', { course: {} });
});

app.post('/courses', ensureLogin, async (req, res) => {
  await axios.post(`${API_BASE}/admin/courses`, req.body);
  res.redirect('/courses');
});

app.get('/courses/:id/edit', ensureLogin, async (req, res) => {
  const { data } = await axios.get(`${API_BASE}/admin/courses`);
  const course = data.find((c) => c.id == req.params.id);
  res.render('course_form', { course });
});

app.post('/courses/:id', ensureLogin, async (req, res) => {
  await axios.put(`${API_BASE}/admin/courses/${req.params.id}`, req.body);
  res.redirect('/courses');
});

app.get('/courses/:id/modules', ensureLogin, async (req, res) => {
  const [modulesResp, coursesResp] = await Promise.all([
    axios.get(`${API_BASE}/admin/courses/${req.params.id}/modules`),
    axios.get(`${API_BASE}/admin/courses`),
  ]);
  const course = coursesResp.data.find((c) => c.id == req.params.id);
  res.render('modules', { modules: modulesResp.data, course });
});

app.post('/courses/:id/modules', ensureLogin, async (req, res) => {
  await axios.post(`${API_BASE}/admin/courses/${req.params.id}/modules`, req.body);
  res.redirect(`/courses/${req.params.id}/modules`);
});

app.get('/modules/:moduleId/lessons', ensureLogin, async (req, res) => {
  const { data: modules } = await axios.get(`${API_BASE}/admin/courses/${req.query.courseId}/modules`);
  const moduleInfo = modules.find((m) => m.id == req.params.moduleId);
  const { data: lessons } = await axios.get(`${API_BASE}/courses/${moduleInfo.course_id}`);
  const grouped = lessons.lessons.filter((l) => l.module_id == moduleInfo.id);
  res.render('lessons', { module: moduleInfo, lessons: grouped, courseId: moduleInfo.course_id });
});

app.post('/modules/:moduleId/lessons', ensureLogin, async (req, res) => {
  await axios.post(`${API_BASE}/modules/${req.params.moduleId}/lessons`, req.body);
  res.redirect(`/modules/${req.params.moduleId}/lessons?courseId=${req.body.course_id}`);
});

app.post('/lessons/:lessonId', ensureLogin, async (req, res) => {
  await axios.put(`${API_BASE}/lessons/${req.params.lessonId}`, req.body);
  res.redirect(`/modules/${req.body.module_id}/lessons?courseId=${req.body.course_id}`);
});

app.get('/orders', ensureLogin, async (req, res) => {
  const { data } = await axios.get(`${API_BASE}/admin/orders`);
  res.render('orders', { orders: data });
});

app.listen(PORT, () => {
  console.log(`Admin dashboard running on ${PORT}`);
});
