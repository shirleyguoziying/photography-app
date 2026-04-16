Page({
  data: {
    banners: [],
    loading: false,
    showModal: false,
    editingBanner: null,
    tempImageUrl: '',
    formData: {
      title: '',
      subtitle: ''
    }
  },

  onLoad() {
    this._loadBanners()
  },

  onShow() {
    this._loadBanners()
  },

  async _loadBanners() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'manageBanners',
        data: { action: 'list' }
      })
      
      if (res.result.success) {
        this.setData({ banners: res.result.data })
      }
    } catch (e) {
      console.error('加载轮播图失败:', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  showAddModal() {
    this.setData({
      showModal: true,
      editingBanner: null,
      tempImageUrl: '',
      formData: { title: '', subtitle: '' }
    })
  },

  editBanner(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      editingBanner: item,
      tempImageUrl: item.imageUrl,
      formData: {
        title: item.title || '',
        subtitle: item.subtitle || ''
      }
    })
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {},

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        wx.showLoading({ title: '上传中...' })
        
        try {
          const cloudPath = `banners/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath,
            filePath: tempFilePath
          })
          
          this.setData({ tempImageUrl: uploadRes.fileID })
          wx.hideLoading()
        } catch (e) {
          console.error('上传失败:', e)
          wx.hideLoading()
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }
    })
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value })
  },

  onSubtitleInput(e) {
    this.setData({ 'formData.subtitle': e.detail.value })
  },

  async saveBanner() {
    const { editingBanner, tempImageUrl, formData } = this.data
    
    if (!tempImageUrl) {
      wx.showToast({ title: '请上传图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })
    
    try {
      const action = editingBanner ? 'update' : 'add'
      const data = editingBanner 
        ? { 
            _id: editingBanner._id, 
            imageUrl: tempImageUrl, 
            title: formData.title, 
            subtitle: formData.subtitle,
            sortOrder: editingBanner.sortOrder
          }
        : { 
            imageUrl: tempImageUrl, 
            title: formData.title, 
            subtitle: formData.subtitle,
            sortOrder: this.data.banners.length
          }
      
      const res = await wx.cloud.callFunction({
        name: 'manageBanners',
        data: { action, data }
      })
      
      if (res.result.success) {
        wx.hideLoading()
        wx.showToast({ title: '保存成功', icon: 'success' })
        this.hideModal()
        this._loadBanners()
      } else {
        throw new Error(res.result.errMsg)
      }
    } catch (e) {
      console.error('保存失败:', e)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  deleteBanner(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个轮播图吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            await wx.cloud.callFunction({
              name: 'manageBanners',
              data: { action: 'delete', data: { _id: id } }
            })
            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'success' })
            this._loadBanners()
          } catch (e) {
            console.error('删除失败:', e)
            wx.hideLoading()
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
