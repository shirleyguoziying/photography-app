const { get, post } = require('../utils/request')

async function listOrders(params = {}) {
  const res = await get('/orders', params)
  return res.data // { list, total, page, pageSize }
}

async function getOrder(orderId) {
  const res = await get(`/orders/${orderId}`)
  return res.data
}

async function cancelOrder(orderId, reason) {
  const res = await post(`/orders/${orderId}/cancel`, { reason })
  return res.data
}

// ===== Admin =====

async function adminListOrders(params = {}) {
  const res = await get('/admin/orders', params)
  return res.data
}

async function adminGetOrder(orderId) {
  const res = await get(`/admin/orders/${orderId}`)
  return res.data
}

async function confirmOrder(orderId) {
  const res = await post(`/admin/orders/${orderId}/confirm`)
  return res.data
}

async function rejectOrder(orderId, reason) {
  const res = await post(`/admin/orders/${orderId}/reject`, { reason })
  return res.data
}

async function completeOrder(orderId) {
  const res = await post(`/admin/orders/${orderId}/complete`)
  return res.data
}

/**
 * Get orders grouped by date for calendar view
 * @param {string} month - YYYY-MM
 */
async function getSchedule(month) {
  const res = await get('/admin/schedule', { month })
  return res.data // { [date]: [order, ...] }
}

module.exports = {
  listOrders,
  getOrder,
  cancelOrder,
  adminListOrders,
  adminGetOrder,
  confirmOrder,
  rejectOrder,
  completeOrder,
  getSchedule,
}
