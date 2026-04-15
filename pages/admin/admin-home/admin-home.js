const { formatDate } = require('../../../utils/date')

Page({
  data: {
    todayStr: formatDate(new Date(), 'MM月DD日'),
    stats: { pendingCount: 0, todayCount: 0, monthlyIncome: 0 },
    todayBookings: [],
    pendingBookings: [],
    loading: true,
  },

  onLoad() {
    this._loadDashboard()
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/admin/admin-home/admin-home')
    }
    this._loadDashboard()
  },

  onPullDownRefresh() {
    this._loadDashboard().finally(() => wx.stopPullDownRefresh())
  },

  async _loadDashboard() {
    this.setData({ loading: true })
    const today = formatDate(new Date())

    try {
      const res = await wx.cloud.callFunction({
        name: 'getBookings',
        data: {}
      })
      
      if (res.result?.success) {
        const allOrders = res.result.bookings || []
        
        const allPending = allOrders.filter(o => o.status === 'pending')
        const allConfirmed = allOrders.filter(o => o.status === 'confirmed')
        const todayBookings = allConfirmed.filter(b => b.preferredDate === today)
        
        const monthlyIncome = allOrders
          .filter(o => o.status === 'completed' && o.income?.amount)
          .reduce((sum, o) => sum + (o.income?.amount || 0), 0)

        this.setData({
          pendingBookings: allPending.slice(0, 5),
          todayBookings,
          stats: {
            pendingCount: allPending.length,
            todayCount: todayBookings.length,
            monthlyIncome,
          },
        })
      } else {
        this._loadFromLocal()
      }
    } catch (e) {
      console.error('云端读取失败:', e)
      this._loadFromLocal()
    } finally {
      this.setData({ loading: false })
    }
  },

  _loadFromLocal() {
    const allOrders = wx.getStorageSync('photo_orders') || []
    
    const allPending = allOrders.filter(o => o.status === 'pending')
    const allConfirmed = allOrders.filter(o => o.status === 'confirmed')
    const todayBookings = allConfirmed.filter(b => b.preferredDate === formatDate(new Date()))
    
    const monthlyIncome = allOrders
      .filter(o => o.status === 'completed' && o.income?.amount)
      .reduce((sum, o) => sum + (o.income?.amount || 0), 0)

    this.setData({
      pendingBookings: allPending.slice(0, 5),
      todayBookings,
      stats: {
        pendingCount: allPending.length,
        todayCount: todayBookings.length,
        monthlyIncome,
      },
    })
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?bookingId=${id}` })
  },

  goToOrders() {
    wx.navigateTo({ url: '/pages/admin/admin-orders/admin-orders' })
  },

  goToCalendar() {
    wx.navigateTo({ url: '/pages/admin/admin-calendar/admin-calendar' })
  },

  goToTodayBookings() {
    wx.navigateTo({ url: '/pages/admin/admin-calendar/admin-calendar' })
  },

  goToIncome() {
    wx.navigateTo({ url: '/pages/admin/admin-income/admin-income' })
  },

  goToProps() {
    wx.navigateTo({ url: '/pages/admin/admin-props/admin-props' })
  },

  goToPortfolio() {
    wx.navigateTo({ url: '/pages/admin/admin-portfolio/admin-portfolio' })
  },

  goToDelivery() {
    wx.navigateTo({ url: '/pages/admin/admin-delivery/admin-delivery' })
  },

  async showMyOpenid() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateBookingStatus',
        data: { bookingId: '_test_' },
      })
      const openid = res.result?.yourOpenid
      if (openid) {
        wx.setClipboardData({ data: openid })
        wx.showModal({ title: '你的 openid（已复制）', content: openid, showCancel: false, confirmText: '知道了' })
      } else {
        wx.showToast({ title: 'openid 已配置', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '获取失败', icon: 'none' })
    }
  },

  subscribePhotographerReminder() {
    wx.showToast({ title: '订阅功能开发中', icon: 'none' })
  },
})
