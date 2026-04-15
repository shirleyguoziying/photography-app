Page({
  data: {
    bookingId: null,
    bookingInfo: null,   // { clientName, characterName, preferredDate }
    photos: [],          // { _id, fileId, isHighlight }
    highlightCount: 0,   // 优质照片数量
    uploading: false,
    uploadProgress: '',  // "3/5"
  },

  async onLoad(options) {
    const bookingId = options.bookingId
    if (!bookingId) { wx.showToast({ title: '参数错误', icon: 'none' }); return }
    this.setData({ bookingId })
    await Promise.all([this._loadBookingInfo(), this._loadPhotos()])
  },

  async _loadBookingInfo() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('bookings').doc(this.data.bookingId).get()
      const b = res.data
      this.setData({
        bookingInfo: {
          clientName:    b.clientName || '客户',
          characterName: b.props?.characterName || '',
          preferredDate: b.preferredDate || '',
        }
      })
    } catch (e) {}
  },

  async _loadPhotos() {
    const db = wx.cloud.database()
    const res = await db.collection('photos')
      .where({ bookingId: this.data.bookingId })
      .orderBy('createdAt', 'asc')
      .get()
    const photos = res.data
    const highlightCount = photos.filter(p => p.isHighlight).length
    this.setData({ photos, highlightCount })
  },

  // ===== 上传 =====
  async chooseAndUpload() {
    if (this.data.uploading) return
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album'],
      success: async (res) => {
        const files = res.tempFiles
        this.setData({ uploading: true, uploadProgress: `0/${files.length}` })

        const db = wx.cloud.database()
        for (let i = 0; i < files.length; i++) {
          this.setData({ uploadProgress: `${i + 1}/${files.length}` })
          const ext = files[i].tempFilePath.split('.').pop() || 'jpg'
          const cloudPath = `deliveries/${this.data.bookingId}/${Date.now()}_${i}.${ext}`
          try {
            const up = await wx.cloud.uploadFile({
              cloudPath,
              filePath: files[i].tempFilePath,
            })
            await db.collection('photos').add({
              data: {
                bookingId: this.data.bookingId,
                fileId: up.fileID,
                isHighlight: false,
                createdAt: db.serverDate(),
              }
            })
          } catch (e) {
            // 单张失败不中断整体
          }
        }

        this.setData({ uploading: false, uploadProgress: '' })
        await this._loadPhotos()
        wx.showToast({ title: `已上传 ${files.length} 张`, icon: 'success' })
      },
    })
  },

  // ===== 切换优质标记 =====
  async toggleHighlight(e) {
    const { id, flag } = e.currentTarget.dataset
    const next = !flag
    const db = wx.cloud.database()
    await db.collection('photos').doc(id).update({ data: { isHighlight: next } })
    const newPhotos = this.data.photos.map(p => p._id === id ? { ...p, isHighlight: next } : p)
    const highlightCount = newPhotos.filter(p => p.isHighlight).length
    this.setData({ photos: newPhotos, highlightCount })
  },

  // ===== 删除 =====
  deletePhoto(e) {
    const { id, fileId } = e.currentTarget.dataset
    wx.showModal({
      title: '删除照片',
      content: '删除后不可恢复，确认删除？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return
        const db = wx.cloud.database()
        await Promise.all([
          wx.cloud.deleteFile({ fileList: [fileId] }).catch(() => {}),
          db.collection('photos').doc(id).remove(),
        ])
        const newPhotos = this.data.photos.filter(p => p._id !== id)
        const highlightCount = newPhotos.filter(p => p.isHighlight).length
        this.setData({ photos: newPhotos, highlightCount })
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  // ===== 预览 =====
  previewPhoto(e) {
    const { index } = e.currentTarget.dataset
    wx.previewMedia({
      sources: this.data.photos.map(p => ({ url: p.fileId, type: 'image' })),
      current: index,
    })
  },

  goBack() {
    wx.navigateBack()
  },
})
