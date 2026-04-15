const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const PREF_LABEL = {
  closeup: '大头为主', halfbody: '半身为主',
  wideshot: '大景为主', atmosphere: '氛围感爱好者', mixed: '混合模式',
}

const STATUS_LABEL = {
  pending: '待确认', confirmed: '已确认',
  completed: '已完成', cancelled: '已取消',
}

exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const { status } = event

  try {
    const openid = context.OPENID || null
    const baseWhere = openid ? { _openid: openid } : {}

    let where
    if (status) {
      where = { ...baseWhere, status }
    } else {
      where = { ...baseWhere, status: _.in(['pending', 'confirmed', 'completed', 'cancelled']) }
    }

    const result = await db.collection('bookings')
      .where(where)
      .limit(100)
      .get()

    const bookings = result.data
      .map((b) => ({
        _id: b._id,
        status: b.status,
        statusLabel: STATUS_LABEL[b.status] || b.status,
        clientName: b.clientName || '客户',
        preferredDate: b.preferredDate || '',
        preferredTime: b.preferredTime || '',
        duration: b.duration || 0,
        peopleCount: b.peopleCount || 1,
        locationName: b.location?.name || '',
        characterName: b.props?.characterName || '',
        shootPrefLabel: PREF_LABEL[b.stylePreferences?.shootPreference] || '',
        createdAt: b.createdAt,
      }))
      .sort((a, b) => (b.preferredDate || '').localeCompare(a.preferredDate || ''))

    return { success: true, bookings }
  } catch (err) {
    return { success: false, error: err.message, bookings: [] }
  }
}