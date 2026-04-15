const { DURATION_OPTIONS, SHOOT_PREFERENCES } = require('../../config/constants')

Page({
  data: {
    currentStep: 0,
    formData: {
      preferredDate: '',
      preferredTime: '',
      duration: 2,
      location: { name: '', address: '', latitude: 0, longitude: 0 },
      locationNotes: '',
      peopleCount: 1,
      props: { characterName: '', referenceImages: [], propItems: [], notes: '' },
      stylePreferences: { shootPreference: '', colorR: 128, colorG: 128, colorB: 128, specialRequests: '' }
    },
    minDate: '',
    timeSlots: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ],
    unavailableTimes: {},
    durationOptions: DURATION_OPTIONS,
    shootPreferences: SHOOT_PREFERENCES,
    cloudProps: [],
    propsLoading: false,
    uploadingImages: false,
    step2Valid: false,
    mapMarkers: [],
    colorHex: '#808080',
    isSaving: false
  },

  onShow() {
    this._loadProps()
  },

  onLoad(options) {
    this.setData({
      minDate: this._today()
    })
    this._updateColorHex()
    this._loadProps()
  },

  async _loadProps() {
    this.setData({ propsLoading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('props').orderBy('order', 'asc').get()
      this.setData({ cloudProps: res.data || [] })
    } catch (e) {
      this.setData({ cloudProps: [] })
    } finally {
      this.setData({ propsLoading: false })
    }
  },

  _today() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  onDateChange(e) {
    this.setData({ 'formData.preferredDate': e.detail.value })
  },

  onTimeSelect(e) {
    const time = e.currentTarget.dataset.time
    if (this.data.unavailableTimes[time]) return
    this.setData({ 'formData.preferredTime': time })
  },

  onDurationSelect(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ 'formData.duration': value })
  },

  nextStep() {
    if (this.data.currentStep === 0) {
      const { preferredDate, preferredTime } = this.data.formData
      if (!preferredDate) {
        wx.showToast({ title: '请选择拍摄日期', icon: 'none' })
        return
      }
      if (!preferredTime) {
        wx.showToast({ title: '请选择拍摄时间', icon: 'none' })
        return
      }
    }
    
    if (this.data.currentStep < 3) {
      this.setData({
        currentStep: this.data.currentStep + 1
      })
    } else {
      this.goToConfirm()
    }
  },

  prevStep() {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 })
    }
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location.name': res.name || '',
          'formData.location.address': res.address || '',
          'formData.location.latitude': res.latitude,
          'formData.location.longitude': res.longitude,
          mapMarkers: [{
            id: 1, latitude: res.latitude, longitude: res.longitude
          }]
        })
      }
    })
  },

  clearLocation() {
    this.setData({
      'formData.location.name': '',
      'formData.location.address': '',
      'formData.location.latitude': 0,
      'formData.location.longitude': 0,
      mapMarkers: []
    })
  },

  onLocationNameInput(e) {
    this.setData({ 'formData.location.name': e.detail.value })
  },

  onLocationAddressInput(e) {
    this.setData({ 'formData.location.address': e.detail.value })
  },

  onLocationNotesInput(e) {
    this.setData({ 'formData.locationNotes': e.detail.value })
  },

  incPeople() {
    const count = this.data.formData.peopleCount || 1
    if (count < 10) {
      this.setData({ 'formData.peopleCount': count + 1 })
    }
  },

  decPeople() {
    const count = this.data.formData.peopleCount || 1
    if (count > 1) {
      this.setData({ 'formData.peopleCount': count - 1 })
    }
  },

  onCharacterNameInput(e) {
    this.setData({ 'formData.props.characterName': e.detail.value })
    this._checkStep2Valid()
  },

  chooseReferenceImages() {
    if (this.data.uploadingImages) return
    
    const currentCount = this.data.formData.props.referenceImages.length
    const maxCount = 9 - currentCount
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths
        const allImages = this.data.formData.props.referenceImages.concat(newImages)
        this.setData({
          'formData.props.referenceImages': allImages
        })
        this._checkStep2Valid()
      }
    })
  },

  removeReferenceImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.formData.props.referenceImages]
    images.splice(index, 1)
    this.setData({
      'formData.props.referenceImages': images
    })
    this._checkStep2Valid()
  },

  toggleProp(e) {
    console.log('toggleProp clicked, id:', e.currentTarget.dataset.id)
    const id = e.currentTarget.dataset.id
    let currentItems = this.data.formData.props.propItems ? [...this.data.formData.props.propItems] : []
    const index = currentItems.indexOf(id)
    
    if (index > -1) {
      currentItems.splice(index, 1)
    } else {
      currentItems.push(id)
    }
    
    console.log('propItems before:', this.data.formData.props.propItems)
    console.log('propItems after:', currentItems)
    
    const newFormData = JSON.parse(JSON.stringify(this.data.formData))
    newFormData.props.propItems = currentItems
    
    this.setData({
      formData: newFormData
    }, () => {
      console.log('setData completed, propItems:', this.data.formData.props.propItems)
    })
  },

  _getPropName(propId) {
    const prop = this.data.cloudProps.find(p => p._id === propId)
    return prop ? prop.name : '未知道具'
  },

  onPropsNotesInput(e) {
    this.setData({ 'formData.props.notes': e.detail.value })
  },

  onShootPreferenceSelect(e) {
    const preference = e.currentTarget.dataset.value
    this.setData({
      'formData.stylePreferences.shootPreference': preference
    })
  },

  _updateColorHex() {
    const { colorR, colorG, colorB } = this.data.formData.stylePreferences
    const toHex = n => Number(n || 0).toString(16).padStart(2, '0')
    const hex = '#' + toHex(colorR) + toHex(colorG) + toHex(colorB)
    this.setData({ colorHex: hex })
  },

  onColorRChange(e) {
    this.setData({
      'formData.stylePreferences.colorR': e.detail.value
    })
    this._updateColorHex()
  },

  onColorGChange(e) {
    this.setData({
      'formData.stylePreferences.colorG': e.detail.value
    })
    this._updateColorHex()
  },

  onColorBChange(e) {
    this.setData({
      'formData.stylePreferences.colorB': e.detail.value
    })
    this._updateColorHex()
  },

  onSpecialRequestInput(e) {
    this.setData({
      'formData.stylePreferences.specialRequests': e.detail.value
    })
  },

  _checkStep2Valid() {
    const { characterName, referenceImages } = this.data.formData.props
    const isValid = characterName && characterName.length > 0 && referenceImages && referenceImages.length > 0
    this.setData({ step2Valid: isValid })
  },

  _autosave() {
    try {
      wx.setStorageSync('photo_booking_draft', this.data.formData)
    } catch (e) {}
  },

  goToConfirm() {
    this.setData({ isSaving: true })
    this._autosave()
    
    setTimeout(() => {
      this.setData({ isSaving: false })
      wx.navigateTo({
        url: '/pages/booking-confirm/booking-confirm'
      }).catch(() => {
        wx.showToast({ title: '请先完成预约信息', icon: 'none' })
      })
    }, 500)
  }
})
