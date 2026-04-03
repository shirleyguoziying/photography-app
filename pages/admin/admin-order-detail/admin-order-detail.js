const orderService = require('../../../services/orderService')

Page({
  data: {
    orderId: null,
    order: null,
    isActing: false,
  },

  async onLoad(options) {
    this.setData({ orderId: options.orderId })
    await this._loadOrder()
  },

  async _loadOrder() {
    try {
      const order = await orderService.adminGetOrder(this.data.orderId)
      this.setData({ order })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async confirmOrder() {
    this.setData({ isActing: true })
    try {
      await orderService.confirmOrder(this.data.orderId)
      wx.showToast({ title: '已确认接单', icon: 'success' })
      await this._loadOrder()
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      this.setData({ isActing: false })
    }
  },

  rejectOrder() {
    wx.showModal({
      title: '拒绝订单',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderService.rejectOrder(this.data.orderId, res.content || '摄影师档期已满')
          wx.showToast({ title: '已拒绝', icon: 'success' })
          await this._loadOrder()
        } catch (e) {}
      }
    })
  },

  async completeOrder() {
    this.setData({ isActing: true })
    try {
      await orderService.completeOrder(this.data.orderId)
      wx.showToast({ title: '拍摄已完成', icon: 'success' })
      await this._loadOrder()
    } finally {
      this.setData({ isActing: false })
    }
  },

  goToDelivery() {
    wx.navigateTo({ url: `/pages/admin/admin-delivery/admin-delivery?orderId=${this.data.orderId}` })
  },
})
