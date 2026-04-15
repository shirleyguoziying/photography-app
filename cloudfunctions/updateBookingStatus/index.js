const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
}

exports.main = async (event) => {
  const db = cloud.database()
  const { bookingId, status, note, income } = event

  try {
    if (status && bookingId && bookingId.startsWith('order_')) {
      return { success: false, error: '本地订单无法通过云端更新' }
    }

    if (status && bookingId && !bookingId.startsWith('order_')) {
      const current = await db.collection('bookings').doc(bookingId).get()
      const currentStatus = current.data.status
      const allowed = VALID_TRANSITIONS[currentStatus] || []
      if (!allowed.includes(status)) {
        return { success: false, error: `不能从 ${currentStatus} 变更为 ${status}` }
      }
    }

    const updateData = { updatedAt: db.serverDate() }
    if (status) updateData.status = status
    if (note !== undefined) updateData.photographerNote = note
    if (income !== undefined) updateData.income = income

    if (bookingId && !bookingId.startsWith('order_')) {
      await db.collection('bookings').doc(bookingId).update({ data: updateData })
    }
    
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}