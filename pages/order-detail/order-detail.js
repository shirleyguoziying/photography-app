const orderService = require('../../services/orderService')
const deliveryService = require('../../services/deliveryService')
const { ORDER_STATUS } = require('../../config/constants')

const CANCELLABLE_STATUSES = [ORDER_STATUS.PENDING_CONFIRMATION, ORDER_STATUS.CONFIRMED]
const DELIVERY_VIEWABLE_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED]

Page({
  data: {
    orderId: null,
    order: null,
    delivery: null,
    canCancel: false,
    canViewDelivery: false,
  },

  async onLoad(options) {
    this.setData({ orderId: options.orderId })
    await this.loadOrder()
  },

  async loadOrder() {
    try {
      const order = await orderService.getOrder(this.data.orderId)
      const canCancel = CANCELLABLE_STATUSES.includes(order.status)
      const canViewDelivery = DELIVERY_VIEWABLE_STATUSES.includes(order.status)

      this.setData({ order, canCancel, canViewDelivery })

      if (canViewDelivery && order.deliveryId) {
        const delivery = await deliveryService.getDelivery(this.data.orderId)
        this.setData({ delivery })
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  goToDelivery() {
    wx.navigateTo({ url: `/pages/delivery/delivery?orderId=${this.data.orderId}` })
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '取消后需重新预约，确认取消吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderService.cancelOrder(this.data.orderId, '用户主动取消')
          wx.showToast({ title: '已取消', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1500)
        } catch (e) {
          wx.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    })
  },
})
