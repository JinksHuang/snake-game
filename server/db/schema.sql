-- Database schema for private course platform
CREATE DATABASE IF NOT EXISTS private_courses DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE private_courses;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  cover_url VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  promo_price DECIMAL(10,2),
  is_published TINYINT(1) DEFAULT 0,
  is_recommended TINYINT(1) DEFAULT 0,
  teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  video_url VARCHAR(255),
  content_richtext TEXT,
  is_preview TINYINT(1) DEFAULT 0,
  duration VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  order_no VARCHAR(64) NOT NULL UNIQUE,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  pay_time TIMESTAMP NULL,
  source_lesson_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS user_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  expire_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  last_lesson_id INT,
  completed_lessons_count INT DEFAULT 0,
  last_visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course_progress (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(64) NOT NULL UNIQUE,
  `value` TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO teachers (name, avatar, bio) VALUES
('黄劲辉', 'https://example.com/teacher-avatar.jpg', '专注商家私域操盘与自媒体变现的讲师');

INSERT INTO courses (title, subtitle, cover_url, description, price, promo_price, is_published, is_recommended, teacher_id)
VALUES ('私域操盘课', '从0到1跑通私域转化闭环', 'https://example.com/course-cover.jpg', '围绕私域获客、转化和复购的系统课程。', 1999.00, 999.00, 1, 1, 1);

INSERT INTO modules (course_id, title, sort_order) VALUES
(1, '私域基础认知', 1),
(1, '获客与引流体系', 2),
(1, '转化与成交玩法', 3);

INSERT INTO lessons (module_id, course_id, title, sort_order, video_url, content_richtext, is_preview, duration) VALUES
(1, 1, '私域时代的机会与误区', 1, 'https://example.com/video1.mp4', '解读私域的核心机会与常见误区。', 1, '08:30'),
(1, 1, '搭建私域资产的底层框架', 2, 'https://example.com/video2.mp4', '搭建私域资产的核心框架。', 0, '10:20'),
(1, 1, '团队分工与角色定位', 3, 'https://example.com/video3.mp4', '如何组建私域团队。', 0, '09:10'),
(2, 1, '内容矩阵与获客路径', 1, 'https://example.com/video4.mp4', '设计内容矩阵，实现稳定获客。', 1, '11:00'),
(2, 1, '投放+公域截流组合拳', 2, 'https://example.com/video5.mp4', '投放、公域截流玩法。', 0, '12:05'),
(2, 1, '社群裂变与小程序导流', 3, 'https://example.com/video6.mp4', '社群裂变案例拆解。', 0, '10:45'),
(3, 1, '转化脚本与陪跑策略', 1, 'https://example.com/video7.mp4', '转化脚本的设计要点。', 0, '09:55'),
(3, 1, '会员运营与复购机制', 2, 'https://example.com/video8.mp4', '会员运营模型。', 0, '08:50'),
(3, 1, '数据跟踪与复盘迭代', 3, 'https://example.com/video9.mp4', '数据复盘与迭代。', 0, '07:40');

INSERT INTO settings (`key`, `value`) VALUES
('community', '{"title":"添加企微进社群","qr":"https://example.com/qrcode.jpg","desc":"添加助手，领取资料包。"}');
