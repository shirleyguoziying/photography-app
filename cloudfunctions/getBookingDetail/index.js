// 云函数：查询单条预约完整详情（管理员，含道具解析）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// ⚠️ 替换为你的 openid
const ADMIN_OPENID = 'YOUR_OPENID_HERE'

const PREF_LABEL = {
  closeup: '大头为主',
  halfbody: '半身为主',
  wideshot: '大景为主',
  atmosphere: '氛围感爱好者',
  mixed: '混合模式',
}

const STATUS_LABEL = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
}

function rgbToHex(r, g, b) {
  const h = v => Number(v || 0).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

exports.main = async (event) => {
  const db = cloud.database()
  const { bookingId } = event

  try {
    // 获取预约
    const bookingRes = await db.collection('bookings').doc(bookingId).get()
    const b = bookingRes.data

    // 解析道具（批量查询 props 集合）
    const propItems = b.props?.propItems || []
    let selectedProps = []
    if (propItems.length > 0) {
      const propsRes = await db.collection('props').get()
      const propMap = {}
      propsRes.data.forEach(p => { propMap[p._id] = p })
      selectedProps = propItems.map(id => propMap[id]).filter(Boolean)
        .map(p => ({ _id: p._id, name: p.name, image: p.image || '' }))
    }

    const sp = b.stylePreferences || {}
    const booking = {
      _id: b._id,
      status: b.status,
      statusLabel: STATUS_LABEL[b.status] || b.status,
      clientName: b.clientName || '客户',
      preferredDate: b.preferredDate || '',
      preferredTime: b.preferredTime || '',
      duration: b.duration || 0,
      peopleCount: b.peopleCount || 1,
      location: b.location || { name: '', address: '' },
      props: {
        characterName: b.props?.characterName || '',
        referenceImages: b.props?.referenceImages || [],
        notes: b.props?.notes || '',
      },
      selectedProps,
      shootPrefLabel: PREF_LABEL[sp.shootPreference] || '',
      colorR: sp.colorR ?? 128,
      colorG: sp.colorG ?? 128,
      colorB: sp.colorB ?? 128,
      colorHex: rgbToHex(sp.colorR ?? 128, sp.colorG ?? 128, sp.colorB ?? 128),
      specialRequests: sp.specialRequests || '',
      photographerNote: b.photographerNote || '',
      createdAt: b.createdAt,
    }

    return { success: true, booking }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
