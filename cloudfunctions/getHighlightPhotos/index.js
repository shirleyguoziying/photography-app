// 云函数：获取所有优质返图（isHighlight = true），供用户端展示
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const db = cloud.database()
  try {
    const result = await db.collection('photos')
      .where({ isHighlight: true })
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    return {
      success: true,
      photos: result.data.map(p => ({
        _id: p._id,
        fileId: p.fileId,
        createdAt: p.createdAt,
      })),
    }
  } catch (err) {
    return { success: false, error: err.message, photos: [] }
  }
}
