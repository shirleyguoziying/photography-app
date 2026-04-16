const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'list':
        return await listBanners()
      case 'add':
        return await addBanner(data)
      case 'update':
        return await updateBanner(data)
      case 'delete':
        return await deleteBanner(data)
      case 'reorder':
        return await reorderBanners(data)
      default:
        return { success: false, errMsg: '未知操作' }
    }
  } catch (err) {
    console.error('操作失败:', err)
    return { success: false, errMsg: err.message }
  }
}

async function listBanners() {
  const res = await db.collection('banners')
    .orderBy('sortOrder', 'asc')
    .orderBy('createdAt', 'desc')
    .get()
  return { success: true, data: res.data }
}

async function addBanner(data) {
  const now = new Date()
  const result = await db.collection('banners').add({
    data: {
      imageUrl: data.imageUrl,
      title: data.title || '',
      subtitle: data.subtitle || '',
      sortOrder: data.sortOrder || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  })
  return { success: true, _id: result._id }
}

async function updateBanner(data) {
  const now = new Date()
  await db.collection('banners').doc(data._id).update({
    data: {
      imageUrl: data.imageUrl,
      title: data.title || '',
      subtitle: data.subtitle || '',
      sortOrder: data.sortOrder,
      updatedAt: now
    }
  })
  return { success: true }
}

async function deleteBanner(data) {
  await db.collection('banners').doc(data._id).remove()
  return { success: true }
}

async function reorderBanners(data) {
  const { banners } = data
  const now = new Date()
  
  for (let i = 0; i < banners.length; i++) {
    await db.collection('banners').doc(banners[i]._id).update({
      data: {
        sortOrder: i,
        updatedAt: now
      }
    })
  }
  return { success: true }
}
