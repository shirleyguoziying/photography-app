const userService = require('../../services/userService')
const auth = require('../../utils/auth')

Page({
  data: {
    user: null,
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/profile/profile')
    }
    this.setData({ user: getApp().globalData.user })
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  bindPhone(e) {
    auth.bindPhone(e.detail.encryptedData, e.detail.iv, e.detail.code)
      .then(() => {
        this.setData({ user: getApp().globalData.user })
        wx.showToast({ title: '绑定成功', icon: 'success' })
      })
      .catch(() => wx.showToast({ title: '绑定失败', icon: 'none' }))
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/webview/webview?type=privacy' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出登录吗？',
      success(res) {
        if (res.confirm) getApp().onLogout()
      }
    })
  },
})
