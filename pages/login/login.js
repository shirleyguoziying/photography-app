const auth = require('../../utils/auth')

Page({
  data: {
    isLoading: false,
  },

  async onWechatLogin() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    try {
      const { token, user } = await auth.login()
      getApp().onLoginSuccess(user, token)
    } catch (err) {
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/webview/webview?type=privacy' })
  },

  openTerms() {
    wx.navigateTo({ url: '/pages/webview/webview?type=terms' })
  },
})
