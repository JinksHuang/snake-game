const { request } = require('../../utils/request');

Page({
  data: {
    orders: []
  },
  onShow() {
    request({
      url: '/orders',
      success: (res) => this.setData({ orders: res.data })
    });
  }
});
