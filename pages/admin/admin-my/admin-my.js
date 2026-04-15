Page({
  data: {
    user: null
  },

  onLoad() {
    const app = getApp()
    this.setData({ user: app.globalData.user })
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/admin/admin-my/admin-my')
    }
  },

  goToPortfolio() {
    wx.navigateTo({ url: '/pages/admin/admin-portfolio/admin-portfolio' })
  },

  goToProps() {
    wx.navigateTo({ url: '/pages/admin/admin-props/admin-props' })
  },

  goToIncome() {
    wx.navigateTo({ url: '/pages/admin/admin-income/admin-income' })
  },

  goToCalendar() {
    wx.navigateTo({ url: '/pages/admin/admin-calendar/admin-calendar' })
  },

  goToDelivery() {
    wx.navigateTo({ url: '/pages/admin/admin-delivery/admin-delivery' })
  },

  toggleRole() {
    const app = getApp()
    app.globalData.role = 'user'
    app.globalData.user = { nickName: '用户', role: 'user' }
    wx.showToast({ title: '已切换为普通用户', icon: 'success' })
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/home/home' })
    }, 1000)
  }
})