const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    course: {},
    modules: [],
    lessons: {},
    purchased: false,
    descNodes: []
  },
  onLoad(options) {
    this.courseId = options.id;
    this.loadDetail();
  },
  loadDetail() {
    request({
      url: `/courses/${this.courseId}`,
      success: (res) => {
        const { course, modules, lessons } = res.data;
        const grouped = {};
        modules.forEach((m) => { grouped[m.id] = lessons.filter((l) => l.module_id === m.id); });
        this.setData({ course, modules, lessons: grouped, descNodes: this.richText(course.description || '') });
        this.checkPurchased();
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
  buy() {
    request({
      url: '/orders',
      method: 'POST',
      data: { course_id: this.courseId },
      success: (res) => {
        const orderId = res.data.order_id;
        request({
          url: '/payments/wechat/unified-order',
          method: 'POST',
          data: { order_id: orderId },
          success: (resp) => {
            // Simulate notify after successful payment
            request({
              url: '/payments/wechat/notify',
              method: 'POST',
              data: { order_no: res.data.order_no, result_code: 'SUCCESS' },
              success: () => {
                wx.showToast({ title: '购买成功' });
                this.checkPurchased();
              }
            });
          }
        });
      }
    });
  },
  goLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lesson = Object.values(this.data.lessons).flat().find((l) => l.id === lessonId);
    if (!lesson) return;
    if (!lesson.is_preview && !this.data.purchased) {
      wx.showToast({ title: '请先购买课程', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/lesson-play/index?courseId=${this.courseId}&lessonId=${lessonId}` });
  },
  richText(text) {
    return [{ type: 'text', text }];
  },
  showCommunity() {
    wx.showModal({ title: '社群入口', content: '运营可在后台配置二维码与说明文案。' });
  }
});
