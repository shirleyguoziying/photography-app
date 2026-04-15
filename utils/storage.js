const KEYS = {
  TOKEN: 'photo_token',
  USER: 'photo_user',
  BOOKING_DRAFT: 'photo_booking_draft',
  ORDERS: 'photo_orders',
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

// Orders storage for development
const getOrders = () => wx.getStorageSync(KEYS.ORDERS) || []
const setOrders = (orders) => wx.setStorageSync(KEYS.ORDERS, orders)
const addOrder = (order) => {
  const orders = getOrders()
  orders.unshift(order)
  setOrders(orders)
}
const getOrder = (orderId) => {
  const orders = getOrders()
  return orders.find(o => o._id === orderId)
}

module.exports = {
  getToken,
  setToken,
  getUser,
  setUser,
  clearSession,
  getBookingDraft,
  setBookingDraft,
  clearBookingDraft,
  getOrders,
  setOrders,
  addOrder,
  getOrder,
}
