const { get, post, put, del, patch } = require('../utils/request')
const { uploadFile } = require('../utils/request')

async function getFeatured() {
  const res = await get('/portfolio/featured')
  return res.data // PortfolioItem[]
}

async function getPhotographerPortfolio(photographerId, params = {}) {
  const res = await get(`/photographers/${photographerId}/portfolio`, params)
  return res.data // { list, total }
}

// ===== Admin =====

async function adminCreateItem(itemData) {
  const res = await post('/admin/portfolio', itemData)
  return res.data
}

async function adminUpdateItem(itemId, itemData) {
  const res = await put(`/admin/portfolio/${itemId}`, itemData)
  return res.data
}

async function adminDeleteItem(itemId) {
  await del(`/admin/portfolio/${itemId}`)
}

async function adminReorder(orderedIds) {
  const res = await patch('/admin/portfolio/reorder', { orderedIds })
  return res.data
}

/**
 * Upload a portfolio photo to object storage via pre-signed URL
 * @param {string} filePath - local temp path from wx.chooseMedia
 * @param {object} metadata - { title, styleTags, isFeatured }
 */
async function uploadPortfolioPhoto(filePath, metadata) {
  // Step 1: Get pre-signed upload URL from backend
  const { uploadUrl, cdnUrl, fileKey } = await post('/admin/portfolio/upload-url', {
    fileName: filePath.split('/').pop(),
    contentType: 'image/jpeg',
  }).then(r => r.data)

  // Step 2: Upload directly to OSS/COS
  await uploadFile(uploadUrl, filePath)

  // Step 3: Create portfolio item record
  const item = await adminCreateItem({
    imageUrl: cdnUrl,
    fileKey,
    ...metadata,
  })
  return item
}

module.exports = {
  getFeatured,
  getPhotographerPortfolio,
  adminCreateItem,
  adminUpdateItem,
  adminDeleteItem,
  adminReorder,
  uploadPortfolioPhoto,
}
