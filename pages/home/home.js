const portfolioService = require('../../services/portfolioService')
const { STYLE_TAGS } = require('../../config/constants')

Page({
  data: {
    styleFilters: ['全部', ...STYLE_TAGS],
    activeStyle: '全部',
    portfolio: [],
    leftColumn: [],
    rightColumn: [],
    isLoading: true,
    hasMore: false,
    page: 1,
    pageSize: 10,
  },

  onShow() {
    // Highlight correct tab
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/home/home')
    }
  },

  onLoad() {
    this.loadPortfolio()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, portfolio: [] })
    this.loadPortfolio().finally(() => wx.stopPullDownRefresh())
  },

  async loadPortfolio() {
    this.setData({ isLoading: true })
    try {
      const { activeStyle, page, pageSize } = this.data
      const params = {
        page,
        pageSize,
        style: activeStyle === '全部' ? undefined : activeStyle,
      }
      const { list, total } = await portfolioService.getFeatured(params)
      const combined = page === 1 ? list : [...this.data.portfolio, ...list]
      this.setData({
        portfolio: combined,
        leftColumn: combined.filter((_, i) => i % 2 === 0),
        rightColumn: combined.filter((_, i) => i % 2 === 1),
        hasMore: combined.length < total,
        isLoading: false,
      })
    } catch (e) {
      this.setData({ isLoading: false })
    }
  },

  onStyleFilter(e) {
    const style = e.currentTarget.dataset.style
    this.setData({ activeStyle: style, page: 1, portfolio: [] })
    this.loadPortfolio()
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadPortfolio()
  },

  onPhotoTap(e) {
    const { item } = e.detail
    // Preview the photo full-screen
    wx.previewMedia({
      sources: this.data.portfolio.map(p => ({ url: p.imageUrl, type: 'image' })),
      current: this.data.portfolio.findIndex(p => p.portfolioItemId === item.portfolioItemId),
    })
  },

  goToBooking() {
    wx.switchTab({ url: '/pages/booking/booking' })
  },
})
