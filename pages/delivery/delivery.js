const deliveryService = require('../../services/deliveryService')
const { formatDate } = require('../../utils/date')

Page({
  data: {
    orderId: null,
    delivery: null,
    formattedDeadline: '',
  },

  async onLoad(options) {
    this.setData({ orderId: options.orderId })
    try {
      const delivery = await deliveryService.getDelivery(options.orderId)
      this.setData({
        delivery,
        formattedDeadline: delivery.selectionDeadline
          ? formatDate(delivery.selectionDeadline, 'MM月DD日')
          : '',
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async onPhotoTap(e) {
    const { photo, index } = e.currentTarget.dataset
    const { delivery } = this.data

    // Full-screen preview
    wx.previewMedia({
      sources: delivery.photos.map(p => ({ url: p.originalUrl, type: 'image' })),
      current: index,
    })

    // Toggle selection if in selection mode
    if (delivery.status === 'client_selecting' && photo.isSelectable) {
      const isSelected = !photo.isSelected
      try {
        await deliveryService.togglePhotoSelection(delivery.deliveryId, photo.photoId, isSelected)
        const photos = [...delivery.photos]
        photos[index] = { ...photos[index], isSelected }
        const selectedCount = photos.filter(p => p.isSelected).length
        this.setData({ 'delivery.photos': photos, 'delivery.selectedCount': selectedCount })
      } catch (e) {}
    }
  },

  downloadAll() {
    const { downloadUrl } = this.data.delivery
    if (!downloadUrl) return
    wx.showModal({
      title: '下载全部照片',
      content: '将在浏览器中打开下载链接',
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({ data: downloadUrl })
          wx.showToast({ title: '链接已复制', icon: 'success' })
        }
      }
    })
  },
})
