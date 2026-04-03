const orderService = require('../../services/orderService')

const STATUS_TABS = [
  { value: '', label: '全部' },
  { value: 'pending_confirmation', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'post_processing', label: '后期中' },
  { value: 'delivered', label: '客片已发' },
  { value: 'completed', label: '已完成' },
]

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeStatus: '',
    orders: [],
    isLoading: true,
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/orders/orders')
    }
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders().finally(() => wx.stopPullDownRefresh())
  },

  async loadOrders() {
    this.setData({ isLoading: true })
    try {
      const { list } = await orderService.listOrders({ status: this.data.activeStatus })
      this.setData({ orders: list, isLoading: false })
    } catch (e) {
      this.setData({ isLoading: false })
    }
  },

  onStatusFilter(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.value })
    this.loadOrders()
  },

  onOrderTap(e) {
    const { item } = e.detail
    wx.navigateTo({ url: `/pages/order-detail/order-detail?orderId=${item.orderId}` })
  },

  goToBooking() {
    wx.switchTab({ url: '/pages/booking/booking' })
  },
})
