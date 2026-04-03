const portfolioService = require('../../../services/portfolioService')
Page({
  data: { itemId: null, item: {}, isSaving: false },
  async onLoad(options) {
    this.setData({ itemId: options.itemId })
    // Load item (would normally fetch from API)
  },
  onTitleInput(e) { this.setData({ 'item.title': e.detail.value }) },
  onFeaturedChange(e) { this.setData({ 'item.isFeatured': e.detail.value }) },
  async saveItem() {
    this.setData({ isSaving: true })
    try {
      await portfolioService.adminUpdateItem(this.data.itemId, this.data.item)
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    } finally { this.setData({ isSaving: false }) }
  },
})
