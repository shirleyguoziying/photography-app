// 云函数：查询某月所有预约（管理员）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// ⚠️ 替换为你的 openid
const ADMIN_OPENID = 'osZ5K14xjgiHQLY2UCCvT5VtAoVQ'

const PREF_LABEL = {
  closeup: '大头为主', halfbody: '半身为主',
  wideshot: '大景为主', atmosphere: '氛围感爱好者', mixed: '混合模式',
}

const STATUS_LABEL = {
  pending: '待确认', confirmed: '已确认',
  completed: '已完成', cancelled: '已取消',
}


// 圆点颜色：黄=待确认，绿=已确认，灰=已完成/已取消
function dotColor(status) {
  if (status === 'completed' || status === 'cancelled') return 'gray'
  if (status === 'confirmed') return 'green'
  return 'yellow' // pending
}

exports.main = async (event) => {
  const db = cloud.database()
  const _ = db.command
  const { month } = event
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: 'invalid month', scheduleMap: {} }
  }

  try {
    const result = await db.collection('bookings')
      .where(_.and([
        { preferredDate: db.RegExp({ regexp: `^${month}` }) },
        { status: _.neq('draft') },
      ]))
      .orderBy('preferredDate', 'asc')
      .orderBy('preferredTime', 'asc')
      .limit(200)
      .get()

    const scheduleMap = {}
    result.data.forEach((b) => {
      const date = b.preferredDate
      if (!date) return
      if (!scheduleMap[date]) scheduleMap[date] = []
      scheduleMap[date].push({
        orderId: b._id,
        shootTime: b.preferredTime || '',
        clientName: b.clientName || '客户',
        location: b.location || { name: '' },
        duration: b.duration || 0,
        peopleCount: b.peopleCount || 1,
        characterName: b.props?.characterName || '',
        shootPrefLabel: PREF_LABEL[b.stylePreferences?.shootPreference] || '',
        status: b.status,
        statusLabel: STATUS_LABEL[b.status] || b.status,
        dotColor: dotColor(b.status),
      })
    })

    return { success: true, scheduleMap }
  } catch (err) {
    return { success: false, error: err.message, scheduleMap: {} }
  }
}
