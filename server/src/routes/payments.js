const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/wechat/unified-order', async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ message: 'order_id required' });
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // TODO: integrate real WeChat unified order
    const payParams = {
      appId: process.env.WECHAT_APPID || 'demo-appid',
      timeStamp: `${Date.now()}`,
      nonceStr: 'mock-nonce',
      package: `prepay_id=mock_prepay_${order.order_no}`,
      signType: 'MD5',
      paySign: 'mock-signature',
    };
    res.json({ order_no: order.order_no, payParams });
  } catch (err) {
    next(err);
  }
});

router.post('/wechat/notify', async (req, res, next) => {
  try {
    const { order_no, result_code } = req.body; // In real world, verify XML + signature
    // TODO: verify signature and handle different trade states
    if (!order_no) return res.status(400).json({ message: 'order_no required' });
    const [[order]] = await pool.query('SELECT * FROM orders WHERE order_no = ?', [order_no]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (result_code !== 'SUCCESS') return res.status(400).json({ message: 'Payment not successful' });

    await pool.query('UPDATE orders SET status = ?, pay_time = NOW() WHERE id = ?', ['PAID', order.id]);
    await pool.query(
      'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE expire_at = expire_at',
      [order.user_id, order.course_id]
    );
    res.json({ message: 'Payment processed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
