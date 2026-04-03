Page({
  openPrivacy() {
    wx.navigateTo({ url: '/pages/webview/webview?type=privacy' })
  },
  openTerms() {
    wx.navigateTo({ url: '/pages/webview/webview?type=terms' })
  },
})
