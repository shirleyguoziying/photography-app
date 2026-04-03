const deliveryService = require('../../../services/deliveryService')

Page({
  data: {
    orderId: null,
    deliveryId: null,
    uploadedPhotos: [],
    isUploading: false,
    uploadedCount: 0,
    totalCount: 0,
    uploadProgress: 0,
    isFinalizing: false,
  },

  async onLoad(options) {
    const { orderId } = options
    this.setData({ orderId })
    // Create or load delivery record
    try {
      const delivery = await deliveryService.adminCreateDelivery(orderId)
      this.setData({ deliveryId: delivery.deliveryId, uploadedPhotos: delivery.photos || [] })
    } catch (e) {}
  },

  async choosePhotos() {
    wx.chooseMedia({
      count: 20,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: async (res) => {
        const files = res.tempFiles
        this.setData({ isUploading: true, totalCount: files.length, uploadedCount: 0 })

        try {
          const results = await deliveryService.uploadDeliveryPhotos(
            this.data.deliveryId,
            files,
            (uploaded, total) => {
              this.setData({
                uploadedCount: uploaded,
                uploadProgress: Math.round((uploaded / total) * 100),
              })
            }
          )

          this.setData({
            uploadedPhotos: [...this.data.uploadedPhotos, ...results.map((r, i) => ({
              photoId: `tmp_${Date.now()}_${i}`,
              thumbnailUrl: r.thumbnailUrl,
              originalUrl: r.cdnUrl,
            }))],
            isUploading: false,
          })
          wx.showToast({ title: `上传成功 ${files.length} 张`, icon: 'success' })
        } catch (e) {
          this.setData({ isUploading: false })
          wx.showToast({ title: '上传失败，请重试', icon: 'none' })
        }
      }
    })
  },

  async finalizeDelivery() {
    this.setData({ isFinalizing: true })
    try {
      await deliveryService.finalizeDelivery(this.data.deliveryId)
      wx.showToast({ title: '客片已发送', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '发送失败', icon: 'none' })
    } finally {
      this.setData({ isFinalizing: false })
    }
  },
})
