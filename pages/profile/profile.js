Page({
  data: {
    user: null,
    isAdmin: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ 
      isAdmin: app.globalData.role === 'admin'
    })
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/profile/profile')
    }
    const app = getApp()
    if (app && app.globalData && app.globalData.user) {
      this.setData({ 
        user: app.globalData.user,
        isAdmin: app.globalData.role === 'admin'
      })
    }
  },

  toggleRole() {
    const app = getApp()
    if (app.globalData.role === 'admin') {
      app.globalData.role = 'user'
      app.globalData.user = { 
        nickName: '用户', 
        role: 'user' 
      }
      this.setData({ 
        isAdmin: false,
        user: app.globalData.user 
      })
      wx.showToast({ title: '已切换为普通用户', icon: 'success' })
    } else {
      wx.showModal({
        title: '切换为摄影师',
        content: '请输入管理员密码：',
        confirmText: '确认',
        editable: true,
        placeholderText: '请输入密码',
        success: (res) => {
          if (res.confirm && res.content === '123456') {
            app.globalData.role = 'admin'
            app.globalData.user = { 
              nickName: '摄影师', 
              role: 'admin' 
            }
            this.setData({ 
              isAdmin: true,
              user: app.globalData.user 
            })
            wx.showToast({ title: '已切换为摄影师', icon: 'success' })
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/admin/admin-home/admin-home' })
            }, 1000)
          } else if (res.confirm) {
            wx.showToast({ title: '密码错误', icon: 'none' })
          }
        }
      })
    }
  },

  goToOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  bindPhone() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  openPrivacy() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  logout() {
    const app = getApp()
    app.globalData.user = null
    app.globalData.role = 'user'
    wx.redirectTo({ url: '/pages/login/login' })
  }
})
