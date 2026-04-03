const orderService = require('../../../services/orderService')
const { formatDate } = require('../../../utils/date')
const { ORDER_STATUS } = require('../../../config/constants')

Page({
  data: {
    photographer: null,
    todayStr: formatDate(new Date(), 'MM月DD日'),
    stats: { pendingCount: 0, todayCount: 0, deliveryCount: 0 },
    todayOrders: [],
    pendingOrders: [],
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/admin/admin-home/admin-home')
    }
    const app = getApp()
    this.setData({ photographer: app.globalData.user })
    this.loadDashboard()
  },

  onPullDownRefresh() {
    this.loadDashboard().finally(() => wx.stopPullDownRefresh())
  },

  async loadDashboard() {
    try {
      const today = formatDate(new Date())
      const [pendingRes, todayRes, deliveryRes] = await Promise.all([
        orderService.adminListOrders({ status: ORDER_STATUS.PENDING_CONFIRMATION, pageSize: 5 }),
        orderService.adminListOrders({ date: today }),
        orderService.adminListOrders({ status: ORDER_STATUS.POST_PROCESSING }),
      ])
      this.setData({
        pendingOrders: pendingRes.list,
        todayOrders: todayRes.list,
        stats: {
          pendingCount: pendingRes.total,
          todayCount: todayRes.total,
          deliveryCount: deliveryRes.total,
        },
      })
    } catch (e) {}
  },

  onOrderTap(e) {
    const { item } = e.detail
    wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?orderId=${item.orderId}` })
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/admin/admin-orders/admin-orders' })
  },
})
