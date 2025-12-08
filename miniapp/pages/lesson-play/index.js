const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    lesson: {},
    modules: [],
    lessons: {},
    purchased: false,
    progress: {},
    totalLessons: 0,
    contentNodes: []
  },
  onLoad(options) {
    this.courseId = options.courseId;
    this.lessonId = options.lessonId;
    this.loadCourseStructure();
    this.loadLesson();
    this.loadProgress();
  },
  loadCourseStructure() {
    request({
      url: `/courses/${this.courseId}`,
      success: (res) => {
        const { modules, lessons } = res.data;
        const grouped = {};
        modules.forEach((m) => { grouped[m.id] = lessons.filter((l) => l.module_id === m.id); });
        this.setData({ modules, lessons: grouped, totalLessons: lessons.length });
        this.checkPurchased();
      }
    });
  },
  loadLesson() {
    request({
      url: `/courses/${this.courseId}/lessons/${this.lessonId}`,
      success: (res) => {
        this.setData({ lesson: res.data, contentNodes: [{ type: 'text', text: res.data.content_richtext || '' }] });
      },
      fail: () => {
        wx.showToast({ title: '请先购买课程', icon: 'none' });
      }
    });
  },
  checkPurchased() {
    request({
      url: '/user/courses',
      success: (res) => {
        const purchased = res.data.some((c) => c.id == this.courseId);
        this.setData({ purchased });
      }
    });
  },
  switchLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lesson = Object.values(this.data.lessons).flat().find((l) => l.id === lessonId);
    if (!lesson) return;
    if (!lesson.is_preview && !this.data.purchased) {
      wx.showToast({ title: '请先购买课程', icon: 'none' });
      return;
    }
    this.lessonId = lessonId;
    this.loadLesson();
  },
  loadProgress() {
    request({
      url: `/user/courses/${this.courseId}/progress`,
      success: (res) => {
        this.setData({ progress: res.data.progress || {}, totalLessons: res.data.total_lessons });
      }
    });
  },
  onShow() {
    this.recordProgress();
  },
  recordProgress() {
    request({
      url: `/user/courses/${this.courseId}/progress`,
      method: 'POST',
      data: { last_lesson_id: this.lessonId, completed_lessons_count: (this.data.progress.completed_lessons_count || 0) + 1 },
      success: () => {
        this.loadProgress();
      }
    });
  },
  showCommunity() {
    wx.showModal({ title: '社群入口', content: '后台设置社群二维码后，这里会展示二维码和说明。' });
  }
});
