const userService = require('../../services/userService')

Page({
  data: {
    user: null,
    form: { nickname: '', avatarUrl: '' },
    isSaving: false,
  },

  onLoad() {
    const user = getApp().globalData.user
    this.setData({
      user,
      form: { nickname: user.nickname || '', avatarUrl: user.avatarUrl || '' },
    })
  },

  onNicknameInput(e) {
    this.setData({ 'form.nickname': e.detail.value })
  },

  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ 'form.avatarUrl': res.tempFiles[0].tempFilePath })
      }
    })
  },

  async save() {
    this.setData({ isSaving: true })
    try {
      await userService.updateProfile(this.data.form)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ isSaving: false })
    }
  },
})
