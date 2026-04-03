const bookingService = require('../../services/bookingService')
const photographerService = require('../../services/photographerService')
const storage = require('../../utils/storage')
const { validateStep, showErrors } = require('../../utils/validator')
const { generateTimeSlots, today } = require('../../utils/date')
const { DURATION_OPTIONS, PROPS_OPTIONS, STYLE_TAGS, MOOD_OPTIONS } = require('../../config/constants')

const EMPTY_FORM = {
  preferredDate: '',
  preferredTime: '',
  duration: 2,
  location: { name: '', address: '', latitude: 0, longitude: 0 },
  locationNotes: '',
  props: { hasOwnOutfit: true, outfitCount: 1, propItems: [], notes: '' },
  stylePreferences: { tags: [], mood: '', specialRequests: '' },
}

Page({
  data: {
    currentStep: 0,
    formData: { ...EMPTY_FORM },
    bookingId: null,

    // Step 0 options
    minDate: today(),
    timeSlots: generateTimeSlots(9, 18, 30),
    unavailableTimes: {},
    durationOptions: DURATION_OPTIONS,

    // Step 2 options
    propsOptions: PROPS_OPTIONS,

    // Step 3 options
    styleTags: STYLE_TAGS,
    moodOptions: MOOD_OPTIONS,

    // Map marker
    mapMarkers: [],

    isSaving: false,
    photographerId: null,
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/booking/booking')
    }
  },

  onLoad(options) {
    const { photographerId } = options
    this.setData({ photographerId })

    // Restore draft if exists
    const draft = storage.getBookingDraft()
    if (draft && draft.photographerId === photographerId) {
      this.setData({ formData: draft.formData, bookingId: draft.bookingId, currentStep: draft.currentStep || 0 })
    }
  },

  // ===== Step 0: Time =====

  onDateChange(e) {
    this.setData({ 'formData.preferredDate': e.detail.value, 'formData.preferredTime': '' })
    this._loadAvailability(e.detail.value)
  },

  async _loadAvailability(date) {
    const { photographerId } = this.data
    if (!photographerId) return
    try {
      const data = await photographerService.getAvailability(photographerId, date, date)
      const slots = data[0]?.slots || []
      const unavailable = {}
      slots.filter(s => s.isBooked).forEach(s => { unavailable[s.startTime] = true })
      this.setData({ unavailableTimes: unavailable })
    } catch (e) {}
  },

  onTimeSelect(e) {
    const time = e.currentTarget.dataset.time
    if (this.data.unavailableTimes[time]) return
    this.setData({ 'formData.preferredTime': time })
  },

  onDurationSelect(e) {
    this.setData({ 'formData.duration': e.currentTarget.dataset.value })
  },

  // ===== Step 1: Location =====

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location': { name: res.name, address: res.address, latitude: res.latitude, longitude: res.longitude },
          mapMarkers: [{ id: 1, latitude: res.latitude, longitude: res.longitude, title: res.name }],
        })
      }
    })
  },

  onLocationNotesInput(e) {
    this.setData({ 'formData.locationNotes': e.detail.value })
  },

  // ===== Step 2: Props =====

  setHasOutfit(e) {
    this.setData({ 'formData.props.hasOwnOutfit': e.currentTarget.dataset.val })
  },

  incOutfitCount() {
    const count = Math.min(this.data.formData.props.outfitCount + 1, 5)
    this.setData({ 'formData.props.outfitCount': count })
  },

  decOutfitCount() {
    const count = Math.max(this.data.formData.props.outfitCount - 1, 1)
    this.setData({ 'formData.props.outfitCount': count })
  },

  toggleProp(e) {
    const key = e.currentTarget.dataset.key
    const items = [...this.data.formData.props.propItems]
    const idx = items.indexOf(key)
    if (idx >= 0) items.splice(idx, 1)
    else items.push(key)
    this.setData({ 'formData.props.propItems': items })
  },

  onPropsNotesInput(e) {
    this.setData({ 'formData.props.notes': e.detail.value })
  },

  // ===== Step 3: Style =====

  toggleStyleTag(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = [...this.data.formData.stylePreferences.tags]
    const idx = tags.indexOf(tag)
    if (idx >= 0) tags.splice(idx, 1)
    else tags.push(tag)
    this.setData({ 'formData.stylePreferences.tags': tags })
  },

  onMoodSelect(e) {
    this.setData({ 'formData.stylePreferences.mood': e.currentTarget.dataset.value })
  },

  onSpecialRequestInput(e) {
    this.setData({ 'formData.stylePreferences.specialRequests': e.detail.value })
  },

  // ===== Navigation =====

  async nextStep() {
    const { currentStep, formData } = this.data
    const errors = validateStep(currentStep, formData)
    if (errors.length > 0) { showErrors(errors); return }

    // Auto-save draft to server
    await this._autosave()

    this.setData({ currentStep: currentStep + 1 })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  prevStep() {
    this.setData({ currentStep: Math.max(0, this.data.currentStep - 1) })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  async goToConfirm() {
    const { currentStep, formData } = this.data
    const errors = validateStep(currentStep, formData)
    if (errors.length > 0) { showErrors(errors); return }

    this.setData({ isSaving: true })
    try {
      await this._autosave()
      wx.navigateTo({
        url: `/pages/booking-confirm/booking-confirm?bookingId=${this.data.bookingId}`,
      })
    } finally {
      this.setData({ isSaving: false })
    }
  },

  async _autosave() {
    const { formData, photographerId } = this.data
    let { bookingId } = this.data

    if (!bookingId) {
      const booking = await bookingService.createDraft(photographerId)
      bookingId = booking.bookingId
      this.setData({ bookingId })
    }

    await bookingService.saveDraft(bookingId, formData)

    // Persist draft locally
    storage.setBookingDraft({ bookingId, photographerId, formData, currentStep: this.data.currentStep })
  },
})
