const portfolioService = require('../../../services/portfolioService')

Page({
  data: {
    portfolio: [],
    displayList: [],
    activeTab: 'all',
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/admin/admin-portfolio/admin-portfolio')
    }
    this.loadPortfolio()
  },

  async loadPortfolio() {
    try {
      const app = getApp()
      const { list } = await portfolioService.getPhotographerPortfolio(app.globalData.user.photographerId)
      this.setData({ portfolio: list })
      this._filterList()
    } catch (e) {}
  },

  _filterList() {
    const { portfolio, activeTab } = this.data
    const displayList = activeTab === 'featured'
      ? portfolio.filter(p => p.isFeatured)
      : portfolio
    this.setData({ displayList })
  },

  setTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
    this._filterList()
  },

  onPhotoTap(e) {
    const { item } = e.detail
    wx.navigateTo({ url: `/pages/admin/admin-portfolio-edit/admin-portfolio-edit?itemId=${item.portfolioItemId}` })
  },

  async toggleFeatured(e) {
    const { itemId, featured } = e.currentTarget.dataset
    try {
      await portfolioService.adminUpdateItem(itemId, { isFeatured: !featured })
      const portfolio = this.data.portfolio.map(p =>
        p.portfolioItemId === itemId ? { ...p, isFeatured: !featured } : p
      )
      this.setData({ portfolio })
      this._filterList()
    } catch (e) {}
  },

  deleteItem(e) {
    const { itemId } = e.currentTarget.dataset
    wx.showModal({
      title: '删除作品',
      content: '删除后无法恢复，确认删除吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return
        await portfolioService.adminDeleteItem(itemId)
        const portfolio = this.data.portfolio.filter(p => p.portfolioItemId !== itemId)
        this.setData({ portfolio })
        this._filterList()
      }
    })
  },

  uploadPhoto() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...' })
        try {
          for (const file of res.tempFiles) {
            await portfolioService.uploadPortfolioPhoto(file.tempFilePath, {
              title: '',
              styleTags: [],
              isFeatured: false,
            })
          }
          wx.hideLoading()
          wx.showToast({ title: '上传成功', icon: 'success' })
          this.loadPortfolio()
        } catch (e) {
          wx.hideLoading()
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }
    })
  },
})
