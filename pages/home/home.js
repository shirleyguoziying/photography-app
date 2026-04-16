Page({
  data: {
    banners: [
      { id: 1, icon: '📸', title: '专业COS摄影', subtitle: '还原你心中的角色', color1: '#c8a97e', color2: '#b8986e' },
      { id: 2, icon: '🌸', title: '多场景拍摄', subtitle: '公园/室内/外景任你选', color1: '#e8b4b8', color2: '#d4989c' },
      { id: 3, icon: '✨', title: '后期精修', subtitle: '每一张都是大片', color1: '#a8d4e8', color2: '#8cc4d8' }
    ],
    waterfallPhotos: [],
    loading: false
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/home/home')
    }
    this._loadBanners()
    this._loadWaterfall()
  },

  onLoad() {
    this._loadBanners()
    this._loadWaterfall()
  },

  async _loadBanners() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('banners')
        .where({ isActive: true })
        .orderBy('sortOrder', 'asc')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
      
      if (res.data && res.data.length > 0) {
        this.setData({ banners: res.data })
      }
    } catch (e) {
      console.error('加载轮播图失败:', e)
    }
  },

  async _loadWaterfall() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('portfolio')
        .where({ isPublic: true })
        .orderBy('sortOrder', 'asc')
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get()
      
      const photos = res.data.map((item, index) => ({
        id: item._id || index,
        url: item.imageUrl || '',
        role: item.title || '作品',
        isFeatured: item.isFeatured || false
      }))
      
      this.setData({ waterfallPhotos: photos })
    } catch (e) {
      console.error('加载瀑布流失败:', e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goToBooking() {
    wx.navigateTo({ 
      url: '/pages/booking/booking',
      fail: (err) => {
        console.error('跳转预约页失败:', err)
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  goToOrders() {
    wx.navigateTo({ 
      url: '/pages/orders/orders',
      fail: (err) => {
        console.error('跳转订单页失败:', err)
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  goToGallery() {
    wx.navigateTo({ url: '/pages/gallery/gallery' }).catch(() => {})
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url],
      current: url
    })
  }
})
