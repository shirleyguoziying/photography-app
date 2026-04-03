const aiService = require('../../services/aiService')

Page({
  data: {
    bookingId: null,
    plan: null,
    isLoading: true,
  },

  onLoad(options) {
    this.setData({ bookingId: options.bookingId })
    this.generatePlan()
  },

  async generatePlan() {
    this.setData({ isLoading: true })
    try {
      const plan = await aiService.generateShootPlan(this.data.bookingId)
      this.setData({ plan, isLoading: false })
    } catch (e) {
      this.setData({ isLoading: false })
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  regenerate() {
    wx.showModal({
      title: '重新生成',
      content: '将重新生成一份新的拍摄策划，确认吗？',
      success(res) {
        if (res.confirm) this.generatePlan()
      }.bind(this)
    })
  },
})
