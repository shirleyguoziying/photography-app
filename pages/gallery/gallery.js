Page({
  data: {
    previewPhotos: [],
    loading: false
  },

  onShow() {
    this._loadGallery()
  },

  onLoad() {
    this._loadGallery()
  },

  async _loadGallery() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('portfolio')
        .where({ isPublic: true })
        .orderBy('sortOrder', 'asc')
        .limit(50)
        .get()
      
      const photos = res.data.map((item, index) => ({
        id: item._id || index,
        url: item.imageUrl || '',
        role: item.title || '作品'
      }))
      
      this.setData({ previewPhotos: photos })
    } catch (e) {
      console.error('加载gallery失败:', e)
    } finally {
      this.setData({ loading: false })
    }
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.previewPhotos.map(p => p.url),
      current: url
    })
  }
})
