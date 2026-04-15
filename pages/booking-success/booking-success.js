Page({
  data: {
    orderId: null,
    reminderSubscribed: false,
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId })
  },

  // ⚠️ 订阅消息需在微信公众平台申请模板后才可使用，开发阶段暂时禁用
  // TODO: 申请订阅消息模板后取消注释
  subscribeReminder() {
    wx.showToast({ title: '订阅功能开发中', icon: 'none' })
    // const TMPL_SHOOT_REMINDER = 'YOUR_USER_TEMPLATE_ID'
    // wx.requestSubscribeMessage({
    //   tmplIds: [TMPL_SHOOT_REMINDER],
    //   success: async (res) => {
    //     const accepted = res[TMPL_SHOOT_REMINDER] === 'accept'
    //     if (accepted) {
    //       const db = wx.cloud.database()
    //       await db.collection('bookings').doc(this.data.orderId)
    //         .update({ data: { userSubscribed: true } })
    //         .catch(() => {})
    //       this.setData({ reminderSubscribed: true })
    //       wx.showToast({ title: '提醒已开启', icon: 'success' })
    //     } else {
    //       wx.showToast({ title: '已拒绝，不会发送提醒', icon: 'none' })
    //     }
    //   },
    //   fail: () => wx.showToast({ title: '开启失败，请重试', icon: 'none' }),
    // })
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },
})
