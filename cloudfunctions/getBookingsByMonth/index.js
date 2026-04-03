// 云函数：查询某个月的所有预约记录（管理员专用，可读全部用户数据）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  const _ = db.command

  // event.month 格式：'YYYY-MM'
  const { month } = event
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: 'invalid month format', scheduleMap: {} }
  }

  try {
    // 查询该月所有非草稿预约，最多返回 200 条
    const result = await db.collection('bookings')
      .where(
        _.and([
          { preferredDate: db.RegExp({ regexp: `^${month}` }) },
          { status: _.neq('draft') },
        ])
      )
      .orderBy('preferredDate', 'asc')
      .orderBy('preferredTime', 'asc')
      .limit(200)
      .get()

    // 按日期分组，构建 scheduleMap: { 'YYYY-MM-DD': [booking, ...] }
    const scheduleMap = {}
    result.data.forEach((booking) => {
      const date = booking.preferredDate
      if (!date) return
      if (!scheduleMap[date]) scheduleMap[date] = []
      scheduleMap[date].push({
        orderId: booking._id,
        shootTime: booking.preferredTime || '',
        clientName: booking.clientName || '客户',
        clientAvatar: booking.clientAvatar || '',
        location: booking.location || { name: '', address: '' },
        duration: booking.duration || 0,
        status: booking.status,
        stylePreferences: booking.stylePreferences || {},
        props: booking.props || {},
      })
    })

    return { success: true, scheduleMap }
  } catch (err) {
    return { success: false, error: err.message, scheduleMap: {} }
  }
}
