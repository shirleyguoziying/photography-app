const KEYS = {
  TOKEN: 'photo_token',
  USER: 'photo_user',
  BOOKING_DRAFT: 'photo_booking_draft',
}

const getToken = () => wx.getStorageSync(KEYS.TOKEN) || null
const setToken = (token) => wx.setStorageSync(KEYS.TOKEN, token)

const getUser = () => wx.getStorageSync(KEYS.USER) || null
const setUser = (user) => wx.setStorageSync(KEYS.USER, user)

const clearSession = () => {
  wx.removeStorageSync(KEYS.TOKEN)
  wx.removeStorageSync(KEYS.USER)
}

// Persist booking draft across page navigations
const getBookingDraft = () => wx.getStorageSync(KEYS.BOOKING_DRAFT) || null
const setBookingDraft = (draft) => wx.setStorageSync(KEYS.BOOKING_DRAFT, draft)
const clearBookingDraft = () => wx.removeStorageSync(KEYS.BOOKING_DRAFT)

module.exports = {
  getToken,
  setToken,
  getUser,
  setUser,
  clearSession,
  getBookingDraft,
  setBookingDraft,
  clearBookingDraft,
}
