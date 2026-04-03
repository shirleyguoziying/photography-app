const bookingService = require('../../services/bookingService')

Page({
  data: {
    orderId: null,
    reminderSubscribed: false,
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId })
  },

  // Must be called from a tap handler to satisfy WeChat's user-gesture requirement
  async subscribeReminder() {
    const accepted = await bookingService.requestReminderPermission(this.data.orderId)
    if (accepted) {
      this.setData({ reminderSubscribed: true })
      wx.showToast({ title: '提醒已开启', icon: 'success' })
    }
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },
})
