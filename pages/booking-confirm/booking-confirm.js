const { SHOOT_PREFERENCES } = require('../../config/constants')

const PREF_LABEL = {}
SHOOT_PREFERENCES.forEach(p => { PREF_LABEL[p.value] = p.title })

function rgbToHex(r, g, b) {
  const toHex = v => Number(v || 0).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

Page({
  data: {
    bookingId: null,
    booking: null,
    selectedProps: [],
    shootPrefLabel: '',
    colorHex: '#808080',
    isSubmitting: false
  },

  async onLoad(options) {
    try {
      let booking
      const draft = wx.getStorageSync('photo_booking_draft')
      if (draft) {
        booking = {
          ...draft,
          _id: 'draft_' + Date.now(),
          status: 'draft'
        }
      }

      if (!booking) {
        wx.showToast({ title: '加载失败', icon: 'none' })
        return
      }

      const sp = booking.stylePreferences || {}
      const colorHex = rgbToHex(sp.colorR || 128, sp.colorG || 128, sp.colorB || 128)
      const shootPrefLabel = PREF_LABEL[sp.shootPreference] || ''

      let selectedProps = []
      if (booking.props && booking.props.propItems && booking.props.propItems.length > 0) {
        const propItems = booking.props.propItems
        const db = wx.cloud.database()
        try {
          const res = await db.collection('props').get()
          selectedProps = res.data.filter(p => propItems.includes(p._id)).map(p => ({
            _id: p._id,
            name: p.name,
            description: p.description
          }))
        } catch (e) {
          console.error('加载道具失败:', e)
          selectedProps = propItems.map(id => ({ _id: id, name: '道具', description: '' }))
        }
      }

      this.setData({
        booking,
        shootPrefLabel,
        colorHex,
        selectedProps
      })
    } catch (e) {
      console.error('Load booking error:', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  submitBooking() {
    if (this.data.isSubmitting) {
      return
    }
    
    this.setData({ isSubmitting: true })
    
    const newOrder = {
      ...this.data.booking,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this._submitToCloud(newOrder)
  },

  async _submitToCloud(order) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'createBooking',
        data: { booking: order }
      })
      
      if (res.result?.success) {
        wx.showToast({ title: '预约成功！', icon: 'success', duration: 1000 })
        order._id = res.result.bookingId
        order._fromCloud = true
      } else {
        console.log('云端创建失败，使用本地存储')
      }
    } catch (e) {
      console.log('云端创建失败:', e.message)
    }
    
    this._saveLocal(order)
  },

  _saveLocal(order) {
    try {
      const existingOrders = wx.getStorageSync('photo_orders') || []
      existingOrders.unshift(order)
      wx.setStorageSync('photo_orders', existingOrders)
      
      wx.showToast({ title: '预约成功！', icon: 'success', duration: 1000 })
      
      setTimeout(() => {
        wx.removeStorageSync('photo_booking_draft')
        wx.redirectTo({ url: '/pages/orders/orders' })
      }, 1000)
    } catch (e) {
      console.error('Save order error:', e)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      this.setData({ isSubmitting: false })
    }
  }
})
