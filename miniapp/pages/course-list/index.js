const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    courses: []
  },
  onLoad() {
    this.ensureLogin();
  },
  ensureLogin() {
    if (!app.globalData.token) {
      app.login(() => {
        this.fetchCourses();
      });
    } else {
      this.fetchCourses();
    }
  },
  fetchCourses() {
    request({
      url: '/courses',
      success: (res) => {
        const courses = res.data.map((c) => ({ ...c, purchased: false }));
        this.setData({ courses });
        // merge purchase info
        request({
          url: '/user/courses',
          success: (resp) => {
            const purchasedIds = resp.data.map((c) => c.id);
            const merged = courses.map((c) => ({ ...c, purchased: purchasedIds.includes(c.id) }));
            this.setData({ courses: merged });
          }
        });
      }
    });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-detail/index?id=${id}` });
  }
});
