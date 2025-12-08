App({
  globalData: {
    token: wx.getStorageSync('token') || '',
    userInfo: null,
    baseURL: 'http://localhost:3001'
  },
  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },
  login(callback) {
    const app = this;
    wx.login({
      success(res) {
        const code = res.code;
        wx.request({
          url: `${app.globalData.baseURL}/auth/login-miniapp`,
          method: 'POST',
          data: { code },
          success(resp) {
            const { token, user } = resp.data;
            app.globalData.token = token;
            app.globalData.userInfo = user;
            wx.setStorageSync('token', token);
            callback && callback(user);
          },
          fail() {
            wx.showToast({ title: '登录失败', icon: 'error' });
          }
        });
      }
    });
  }
});
