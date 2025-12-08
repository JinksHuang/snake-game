const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    user: {},
    courses: []
  },
  onShow() {
    this.setData({ user: app.globalData.userInfo || {} });
    request({
      url: '/user/courses',
      success: (res) => {
        this.setData({ courses: res.data });
      }
    });
  },
  goOrders() {
    wx.navigateTo({ url: '/pages/orders/index' });
  }
});
