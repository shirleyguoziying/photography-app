const URLS = {
  privacy: 'https://yourphotography.com/privacy',
  terms: 'https://yourphotography.com/terms',
}

Page({
  data: { url: '' },

  onLoad(options) {
    const { type, url } = options
    const target = url || URLS[type] || ''
    wx.setNavigationBarTitle({ title: type === 'privacy' ? '隐私政策' : '用户协议' })
    this.setData({ url: target })
  },

  onMessage() {},
})
