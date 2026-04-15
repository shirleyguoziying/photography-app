// 使用微信云开发数据库

async function getFeatured() {
  const db = wx.cloud.database()
  const res = await db.collection('portfolio')
    .where({ isFeatured: true })
    .orderBy('createdAt', 'desc')
    .get()
  return res.data
}

async function getPhotographerPortfolio(photographerId, params = {}) {
  const db = wx.cloud.database()
  const _ = db.command
  
  let query = { _openid: _.exists(true) }
  
  if (photographerId) {
    query.photographerId = photographerId
  }
  
  const res = await db.collection('portfolio')
    .where(query)
    .orderBy('sortOrder', 'asc')
    .orderBy('createdAt', 'desc')
    .get()
  
  return { list: res.data, total: res.data.length }
}

async function getPublicPortfolio(photographerId) {
  const db = wx.cloud.database()
  const res = await db.collection('portfolio')
    .where({ photographerId, isPublic: true })
    .orderBy('sortOrder', 'asc')
    .orderBy('createdAt', 'desc')
    .get()
  return res.data
}

async function adminCreateItem(itemData) {
  const db = wx.cloud.database()
  const res = await db.collection('portfolio').add({
    data: {
      ...itemData,
      createdAt: db.serverDate(),
      sortOrder: 0,
    }
  })
  return { portfolioItemId: res._id }
}

async function adminUpdateItem(itemId, itemData) {
  const db = wx.cloud.database()
  await db.collection('portfolio').doc(itemId).update({
    data: {
      ...itemData,
      updatedAt: db.serverDate(),
    }
  })
  return { success: true }
}

async function adminDeleteItem(itemId) {
  const db = wx.cloud.database()
  await db.collection('portfolio').doc(itemId).remove()
  return { success: true }
}

async function adminReorder(orderedIds) {
  const db = wx.cloud.database()
  for (let i = 0; i < orderedIds.length; i++) {
    await db.collection('portfolio').doc(orderedIds[i]).update({
      data: { sortOrder: i }
    })
  }
  return { success: true }
}

async function uploadPortfolioPhoto(filePath, metadata) {
  const db = wx.cloud.database()
  
  const ext = filePath.split('.').pop() || 'jpg'
  const cloudPath = `portfolio/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
  
  const uploadRes = await wx.cloud.uploadFile({
    cloudPath,
    filePath,
  })
  
  const itemData = {
    imageUrl: uploadRes.fileID,
    fileKey: cloudPath,
    title: metadata.title || '',
    styleTags: metadata.styleTags || [],
    isFeatured: metadata.isFeatured || false,
    isPublic: true,
    photographerId: getApp().globalData.user?.photographerId || '',
    sortOrder: 0,
  }
  
  const res = await db.collection('portfolio').add({
    data: itemData
  })
  
  return { portfolioItemId: res._id, imageUrl: uploadRes.fileID }
}

module.exports = {
  getFeatured,
  getPhotographerPortfolio,
  getPublicPortfolio,
  adminCreateItem,
  adminUpdateItem,
  adminDeleteItem,
  adminReorder,
  uploadPortfolioPhoto,
}