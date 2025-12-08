const app = getApp();

function request({ url, method = 'GET', data = {}, success, fail }) {
  const token = app?.globalData?.token || '';
  wx.request({
    url: `${app.globalData.baseURL}${url}`,
    method,
    data,
    header: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    success(res) {
      if (res.statusCode === 401) {
        app.login(() => {
          request({ url, method, data, success, fail });
        });
        return;
      }
      success && success(res);
    },
    fail(err) {
      fail && fail(err);
      wx.showToast({ title: '网络异常', icon: 'error' });
    },
  });
}

module.exports = { request };
