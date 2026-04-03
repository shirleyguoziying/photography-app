const bookingService = require('../../services/bookingService')
const storage = require('../../utils/storage')

Page({
  data: {
    bookingId: null,
    booking: null,
    isSubmitting: false,
  },

  async onLoad(options) {
    const { bookingId } = options
    this.setData({ bookingId })

    try {
      const booking = await bookingService.getBooking(bookingId)
      this.setData({ booking })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  goToAiPlanning() {
    wx.navigateTo({
      url: `/pages/ai-planning/ai-planning?bookingId=${this.data.bookingId}`,
    })
  },

  async submitBooking() {
    this.setData({ isSubmitting: true })
    try {
      const { orderId } = await bookingService.submitBooking(this.data.bookingId)
      storage.clearBookingDraft()

      // Navigate to success page, which will request subscribe message permission
      wx.redirectTo({
        url: `/pages/booking-success/booking-success?orderId=${orderId}`,
      })
    } catch (e) {
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },
})
