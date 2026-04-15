Page({
  data: {
    props: [],
    loading: true,

    // 新增/编辑表单
    showForm: false,
    editingId: null,       // null = 新增，有值 = 编辑
    form: { name: '', description: '', image: '', imageLocal: '' },
    uploading: false,
    saving: false,
  },

  onLoad() {
    this._loadProps()
  },

  async _loadProps() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('props').orderBy('order', 'asc').get()
      this.setData({ props: res.data })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // ===== 新增 =====

  openAddForm() {
    this.setData({
      showForm: true,
      editingId: null,
      form: { name: '', description: '', image: '', imageLocal: '' },
    })
  },

  // ===== 编辑 =====

  openEditForm(e) {
    const prop = e.currentTarget.dataset.prop
    this.setData({
      showForm: true,
      editingId: prop._id,
      form: { name: prop.name, description: prop.description || '', image: prop.image, imageLocal: '' },
    })
  },

  // ===== 关闭表单 =====

  closeForm() {
    this.setData({ showForm: false })
  },

  // ===== 表单输入 =====

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  onDescInput(e) {
    this.setData({ 'form.description': e.detail.value })
  },

  // ===== 上传道具图片 =====

  choosePropImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = res.tempFiles[0].tempFilePath
        this.setData({ 'form.imageLocal': filePath, uploading: true })
        try {
          const ext = filePath.split('.').pop() || 'jpg'
          const cloudPath = `props/${Date.now()}.${ext}`
          const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath })
          this.setData({ 'form.image': uploadRes.fileID })
        } catch (e) {
          wx.showToast({ title: '图片上传失败', icon: 'none' })
          this.setData({ 'form.imageLocal': '' })
        } finally {
          this.setData({ uploading: false })
        }
      },
    })
  },

  // ===== 保存（新增或更新） =====

  async saveProp() {
    const { form, editingId, props } = this.data
    if (!form.name.trim()) {
      wx.showToast({ title: '请填写道具名称', icon: 'none' })
      return
    }
    if (!form.image) {
      wx.showToast({ title: '请上传道具图片', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    const db = wx.cloud.database()
    try {
      if (editingId) {
        // 更新
        await db.collection('props').doc(editingId).update({
          data: { name: form.name.trim(), description: form.description.trim(), image: form.image },
        })
        wx.showToast({ title: '已更新', icon: 'success' })
      } else {
        // 新增：order = 当前数量
        await db.collection('props').add({
          data: {
            name: form.name.trim(),
            description: form.description.trim(),
            image: form.image,
            order: props.length,
            createdAt: db.serverDate(),
          },
        })
        wx.showToast({ title: '已添加', icon: 'success' })
      }
      this.setData({ showForm: false })
      this._loadProps()
    } catch (e) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },

  // ===== 删除 =====

  deleteProp(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '删除后用户将无法选择此道具，已选的预约不受影响',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return
        try {
          const db = wx.cloud.database()
          await db.collection('props').doc(id).remove()
          wx.showToast({ title: '已删除', icon: 'success' })
          this._loadProps()
        } catch (e) {
          wx.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  },
})
