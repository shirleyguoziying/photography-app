const STATUS_LABEL = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消'
}

Page({
  data: {
    statusTabs: [
      { value: '', label: '全部' },
      { value: 'pending', label: '待确认' },
      { value: 'confirmed', label: '已确认' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ],
    activeStatus: '',
    orders: [],
    isLoading: false
  },

  onShow() {
    this.loadOrders()
  },

  onLoad() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders()
    wx.stopPullDownRefresh()
  },

  loadOrders() {
    this.setData({ isLoading: true })
    this._loadFromCloud()
  },

  async _loadFromCloud() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getBookings',
        data: {}
      })
      
      if (res.result?.success) {
        const allOrders = res.result.bookings || []
        this._processOrders(allOrders)
      } else {
        this._loadFromLocal()
      }
    } catch (e) {
      console.log('云端读取失败:', e.message)
      this._loadFromLocal()
    }
  },

  _loadFromLocal() {
    try {
      const allOrders = wx.getStorageSync('photo_orders') || []
      this._processOrders(allOrders)
    } catch (e) {
      console.error('Load orders error:', e)
      this.setData({
        orders: [],
        isLoading: false
      })
    }
  },

  _processOrders(allOrders) {
    let filteredOrders = allOrders
    if (this.data.activeStatus) {
      filteredOrders = allOrders.filter(order => order.status === this.data.activeStatus)
    }
    
    const formattedOrders = filteredOrders.map(order => {
      const locationName = order.location?.name || order.locationName || ''
      const characterName = order.props?.characterName || order.characterName || ''
      const statusLabel = STATUS_LABEL[order.status] || order.status
      
      return {
        ...order,
        locationName,
        characterName,
        statusLabel,
        clientName: characterName || order.clientName || '预约订单'
      }
    })
    
    this.setData({
      orders: formattedOrders,
      isLoading: false
    })
  },

  onStatusFilter(e) {
    const status = e.currentTarget.dataset.value
    this.setData({ activeStatus: status })
    this.loadOrders()
  },

  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    }).catch(() => {
      wx.showToast({ title: '页面跳转失败', icon: 'none' })
    })
  },

  goToBooking() {
    wx.navigateTo({ url: '/pages/booking/booking' }).catch(() => {
      wx.showToast({ title: '页面跳转失败', icon: 'none' })
    })
  }
})