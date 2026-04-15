const STATUS_TABS = [
  { value: '',          label: '全部' },
  { value: 'pending',   label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeStatus: '',
    bookings: [],
    loading: false,
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/admin/admin-orders/admin-orders')
    }
    this._loadBookings()
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.navigateTo({ url: '/pages/admin/admin-home/admin-home' })
    }
  },

  onPullDownRefresh() {
    this._loadBookings().finally(() => wx.stopPullDownRefresh())
  },

  async _loadBookings() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getBookings',
        data: { status: this.data.activeStatus || undefined },
      })
      if (res.result.success) {
        this.setData({ bookings: res.result.bookings })
      } else {
        wx.showToast({ title: res.result.error === 'unauthorized' ? '无管理员权限' : '加载失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络异常', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onTabTap(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.value })
    this._loadBookings()
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?bookingId=${id}` })
  },
})
