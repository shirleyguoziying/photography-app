const { TMPL_SHOOT_REMINDER } = require('../config/api')

function _db() {
  return wx.cloud.database()
}

/**
 * 在云数据库创建草稿预约记录
 */
async function createDraft(photographerId) {
  const app = getApp()
  const user = app.globalData.user || {}
  const db = _db()

  const res = await db.collection('bookings').add({
    data: {
      photographerId: photographerId || '',
      status: 'draft',
      clientName: user.nickName || user.name || '用户',
      clientAvatar: user.avatarUrl || '',
      preferredDate: '',
      preferredTime: '',
      duration: 2,
      location: { name: '', address: '', latitude: 0, longitude: 0 },
      locationNotes: '',
      props: { hasOwnOutfit: true, outfitCount: 1, propItems: [], notes: '' },
      stylePreferences: { tags: [], mood: '', specialRequests: '' },
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  })

  return { bookingId: res._id }
}

/**
 * 将表单数据自动保存到云数据库（草稿阶段）
 */
async function saveDraft(bookingId, formData) {
  const db = _db()
  await db.collection('bookings').doc(bookingId).update({
    data: {
      ...formData,
      updatedAt: db.serverDate(),
    },
  })
}

/**
 * 提交预约：将状态从 draft 改为 pending（待摄影师确认）
 */
async function submitBooking(bookingId) {
  const db = _db()
  await db.collection('bookings').doc(bookingId).update({
    data: {
      status: 'pending',
      submittedAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  })
  return { orderId: bookingId }
}

/**
 * 通过 bookingId 查询云数据库中的预约详情
 */
async function getBooking(bookingId) {
  const db = _db()
  const res = await db.collection('bookings').doc(bookingId).get()
  return res.data
}

/**
 * 申请订阅消息权限（拍摄提醒），必须在 tap 事件中调用
 */
function requestReminderPermission(orderId) {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: [TMPL_SHOOT_REMINDER],
      success(subscribeRes) {
        resolve(subscribeRes[TMPL_SHOOT_REMINDER] === 'accept')
      },
      fail() {
        resolve(false)
      },
    })
  })
}

module.exports = { createDraft, saveDraft, submitBooking, getBooking, requestReminderPermission }
