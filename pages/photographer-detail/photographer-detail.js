const photographerService = require('../../services/photographerService')
const portfolioService = require('../../services/portfolioService')

Page({
  data: {
    photographerId: null,
    photographer: null,
    portfolio: [],
    leftColumn: [],
    rightColumn: [],
    isLoadingPortfolio: true,
  },

  async onLoad(options) {
    const { id } = options
    this.setData({ photographerId: id })
    wx.showNavigationBarLoading()
    try {
      const photographer = await photographerService.getPhotographer(id)
      this.setData({ photographer })
      wx.setNavigationBarTitle({ title: photographer.displayName })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideNavigationBarLoading()
    }
    this._loadPortfolio()
  },

  async _loadPortfolio() {
    this.setData({ isLoadingPortfolio: true })
    try {
      const { list } = await portfolioService.getPhotographerPortfolio(this.data.photographerId)
      this.setData({
        portfolio: list,
        leftColumn: list.filter((_, i) => i % 2 === 0),
        rightColumn: list.filter((_, i) => i % 2 === 1),
        isLoadingPortfolio: false,
      })
    } catch (e) {
      this.setData({ isLoadingPortfolio: false })
    }
  },

  onPhotoTap(e) {
    const { item } = e.detail
    wx.previewMedia({
      sources: this.data.portfolio.map(p => ({ url: p.imageUrl, type: 'image' })),
      current: this.data.portfolio.findIndex(p => p.portfolioItemId === item.portfolioItemId),
    })
  },

  goToBooking() {
    wx.navigateTo({
      url: `/pages/booking/booking?photographerId=${this.data.photographerId}`,
    })
  },
})
