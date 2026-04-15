const STATUS_LABEL = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消'
}

const { DURATION_OPTIONS, SHOOT_PREFERENCES } = require('../../config/constants')

function rgbToHex(r, g, b) {
  const toHex = v => Number(v || 0).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

Page({
  data: {
    orderId: null,
    order: null,
    canCancel: false,
    canEdit: false,
    showEditModal: false,
    editData: {},
    durationOptions: DURATION_OPTIONS,
    shootPreferences: SHOOT_PREFERENCES,
    timeSlots: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ],
    minDate: ''
  },

  onLoad(options) {
    const orderId = options.orderId || options.bookingId
    this.setData({ orderId, minDate: this._today() })
    this.loadOrder(orderId)
  },

  onShow() {
    if (this.data.orderId) {
      this.loadOrder(this.data.orderId)
    }
  },

  _today() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  loadOrder(orderId) {
    try {
      const orders = wx.getStorageSync('photo_orders') || []
      const order = orders.find(o => o._id === orderId)
      
      if (!order) {
        wx.showToast({ title: '订单不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      
      const statusLabel = STATUS_LABEL[order.status] || order.status
      const locationName = order.location?.name || ''
      const locationAddress = order.location?.address || ''
      const characterName = order.props?.characterName || ''
      const referenceImages = order.props?.referenceImages || []
      const shootPrefLabel = this._getShootPrefLabel(order)
      
      const sp = order.stylePreferences || {}
      const colorHex = rgbToHex(sp.colorR || 128, sp.colorG || 128, sp.colorB || 128)
      
      const canCancel = order.status === 'pending' || order.status === 'confirmed'
      const canEdit = order.status === 'pending'
      
      this.setData({
        order: {
          ...order,
          statusLabel,
          locationName,
          locationAddress,
          characterName,
          referenceImages,
          shootPrefLabel,
          colorHex,
          colorR: sp.colorR || 128,
          colorG: sp.colorG || 128,
          colorB: sp.colorB || 128,
          specialRequests: sp.specialRequests || '',
          resolvedProps: []
        },
        canCancel,
        canEdit,
        editData: this._initEditData(order)
      })
    } catch (e) {
      console.error('Load order error:', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  _initEditData(order) {
    return {
      preferredDate: order.preferredDate || '',
      preferredTime: order.preferredTime || '',
      duration: order.duration || 2,
      locationName: order.location?.name || '',
      locationAddress: order.location?.address || '',
      locationNotes: order.locationNotes || '',
      peopleCount: order.peopleCount || 1,
      characterName: order.props?.characterName || '',
      propsNotes: order.props?.notes || '',
      shootPreference: order.stylePreferences?.shootPreference || '',
      colorR: order.stylePreferences?.colorR || 128,
      colorG: order.stylePreferences?.colorG || 128,
      colorB: order.stylePreferences?.colorB || 128,
      specialRequests: order.stylePreferences?.specialRequests || ''
    }
  },

  _getShootPrefLabel(order) {
    const pref = order.stylePreferences?.shootPreference
    const labels = {
      closeup: '大头为主',
      halfbody: '半身为主',
      wideshot: '大景为主',
      atmosphere: '氛围感爱好者',
      mixed: '混合模式'
    }
    return labels[pref] || ''
  },

  cancelOrder() {
    wx.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？此操作不可撤销。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this._doCancel()
        }
      }
    })
  },

  _doCancel() {
    wx.showLoading({ title: '处理中...' })
    
    try {
      const orders = wx.getStorageSync('photo_orders') || []
      const updatedOrders = orders.map(o => {
        if (o._id === this.data.orderId) {
          return { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() }
        }
        return o
      })
      
      wx.setStorageSync('photo_orders', updatedOrders)
      
      this._sendNotification('order_cancelled', {
        orderId: this.data.orderId,
        message: '用户取消了预约'
      })
      
      wx.hideLoading()
      wx.showToast({ title: '已取消预约', icon: 'success' })
      
      setTimeout(() => {
        this.loadOrder(this.data.orderId)
      }, 1000)
    } catch (e) {
      wx.hideLoading()
      console.error('Cancel error:', e)
      wx.showToast({ title: '取消失败', icon: 'none' })
    }
  },

  editOrder() {
    this.setData({ 
      showEditModal: true,
      editData: this._initEditData(this.data.order)
    })
  },

  onEditModalClose() {
    this.setData({ showEditModal: false })
  },

  onEditDateChange(e) {
    this.setData({ 'editData.preferredDate': e.detail.value })
  },

  onEditTimeSelect(e) {
    const time = e.currentTarget.dataset.time
    this.setData({ 'editData.preferredTime': time })
  },

  onEditDurationSelect(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ 'editData.duration': value })
  },

  onEditPeopleInc() {
    const count = this.data.editData.peopleCount || 1
    if (count < 10) {
      this.setData({ 'editData.peopleCount': count + 1 })
    }
  },

  onEditPeopleDec() {
    const count = this.data.editData.peopleCount || 1
    if (count > 1) {
      this.setData({ 'editData.peopleCount': count - 1 })
    }
  },

  onEditLocationNameInput(e) {
    this.setData({ 'editData.locationName': e.detail.value })
  },

  onEditLocationAddressInput(e) {
    this.setData({ 'editData.locationAddress': e.detail.value })
  },

  onEditLocationNotesInput(e) {
    this.setData({ 'editData.locationNotes': e.detail.value })
  },

  onEditCharacterNameInput(e) {
    this.setData({ 'editData.characterName': e.detail.value })
  },

  onEditPropsNotesInput(e) {
    this.setData({ 'editData.propsNotes': e.detail.value })
  },

  onEditShootPreferenceSelect(e) {
    const preference = e.currentTarget.dataset.value
    this.setData({ 'editData.shootPreference': preference })
  },

  onEditColorRChange(e) {
    this.setData({ 'editData.colorR': e.detail.value })
  },

  onEditColorGChange(e) {
    this.setData({ 'editData.colorG': e.detail.value })
  },

  onEditColorBChange(e) {
    this.setData({ 'editData.colorB': e.detail.value })
  },

  onEditSpecialRequestsInput(e) {
    this.setData({ 'editData.specialRequests': e.detail.value })
  },

  saveEdit() {
    const { editData } = this.data
    
    if (!editData.preferredDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!editData.preferredTime) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }
    if (!editData.characterName) {
      wx.showToast({ title: '请填写角色名', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '确认修改',
      content: '确定要保存这些修改吗？',
      success: (res) => {
        if (res.confirm) {
          this._doSaveEdit()
        }
      }
    })
  },

  _doSaveEdit() {
    wx.showLoading({ title: '保存中...' })
    
    try {
      const orders = wx.getStorageSync('photo_orders') || []
      const updatedOrders = orders.map(o => {
        if (o._id === this.data.orderId) {
          const updated = { 
            ...o, 
            updatedAt: new Date().toISOString(),
            preferredDate: this.data.editData.preferredDate,
            preferredTime: this.data.editData.preferredTime,
            duration: this.data.editData.duration,
            peopleCount: this.data.editData.peopleCount,
            locationNotes: this.data.editData.locationNotes
          }
          
          if (this.data.editData.locationName || this.data.editData.locationAddress) {
            updated.location = {
              ...o.location,
              name: this.data.editData.locationName,
              address: this.data.editData.locationAddress
            }
          }
          
          if (this.data.editData.characterName || this.data.editData.propsNotes) {
            updated.props = {
              ...o.props,
              characterName: this.data.editData.characterName,
              notes: this.data.editData.propsNotes
            }
          }
          
          updated.stylePreferences = {
            ...o.stylePreferences,
            shootPreference: this.data.editData.shootPreference,
            colorR: this.data.editData.colorR,
            colorG: this.data.editData.colorG,
            colorB: this.data.editData.colorB,
            specialRequests: this.data.editData.specialRequests
          }
          
          return updated
        }
        return o
      })
      
      wx.setStorageSync('photo_orders', updatedOrders)
      
      this._sendNotification('order_updated', {
        orderId: this.data.orderId,
        message: '用户修改了预约信息'
      })
      
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ showEditModal: false })
      
      setTimeout(() => {
        this.loadOrder(this.data.orderId)
      }, 500)
    } catch (e) {
      wx.hideLoading()
      console.error('Save edit error:', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  _sendNotification(type, data) {
    console.log('Sending notification:', type, data)
    
    const notifications = wx.getStorageSync('photo_notifications') || []
    notifications.unshift({
      _id: 'notif_' + Date.now(),
      type,
      data,
      read: false,
      createdAt: new Date().toISOString()
    })
    
    wx.setStorageSync('photo_notifications', notifications)
  },

  goBack() {
    wx.navigateBack()
  }
})
