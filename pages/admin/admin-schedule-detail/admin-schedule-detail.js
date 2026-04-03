const orderService = require('../../../services/orderService')
Page({
  data: { date: '', orders: [] },
  async onLoad(options) {
    this.setData({ date: options.date })
    const schedule = await orderService.getSchedule(options.date?.slice(0, 7))
    this.setData({ orders: schedule[options.date] || [] })
  },
  onOrderTap(e) { wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?orderId=${e.detail.item.orderId}` }) },
})
