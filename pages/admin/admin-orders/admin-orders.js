const orderService = require('../../../services/orderService')
const STATUS_TABS = [
  { value: '', label: '全部' }, { value: 'pending_confirmation', label: '待确认' },
  { value: 'confirmed', label: '已确认' }, { value: 'post_processing', label: '后期中' },
  { value: 'delivered', label: '已发片' }, { value: 'completed', label: '已完成' },
]
Page({
  data: { statusTabs: STATUS_TABS, activeStatus: '', orders: [] },
  onShow() {
    if (typeof this.getTabBar === 'function') this.getTabBar().setSelected('pages/admin/admin-orders/admin-orders')
    this.loadOrders()
  },
  onPullDownRefresh() { this.loadOrders().finally(() => wx.stopPullDownRefresh()) },
  async loadOrders() {
    try {
      const { list } = await orderService.adminListOrders({ status: this.data.activeStatus })
      this.setData({ orders: list })
    } catch(e) {}
  },
  onStatusFilter(e) { this.setData({ activeStatus: e.currentTarget.dataset.value }); this.loadOrders() },
  onOrderTap(e) { wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?orderId=${e.detail.item.orderId}` }) },
})
