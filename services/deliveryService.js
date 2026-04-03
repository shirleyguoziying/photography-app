const { get, post, patch } = require('../utils/request')
const { uploadFile } = require('../utils/request')

// ===== User =====

async function getDelivery(orderId) {
  const res = await get(`/orders/${orderId}/delivery`)
  return res.data
}

async function togglePhotoSelection(deliveryId, photoId, isSelected) {
  const res = await patch(`/delivery/${deliveryId}/photos`, { photoId, isSelected })
  return res.data
}

// ===== Admin =====

async function adminCreateDelivery(orderId) {
  const res = await post(`/admin/orders/${orderId}/delivery`)
  return res.data
}

/**
 * Upload multiple delivery photos
 * @param {string} deliveryId
 * @param {Array<{tempFilePath: string}>} files - from wx.chooseMedia
 * @param {Function} onProgress - (uploadedCount, totalCount) => void
 */
async function uploadDeliveryPhotos(deliveryId, files, onProgress) {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const { tempFilePath } = files[i]
    const fileName = `delivery_${deliveryId}_${Date.now()}_${i}.jpg`

    // Get pre-signed URL for each file
    const { uploadUrl, cdnUrl, thumbnailUrl } = await post(
      `/admin/delivery/${deliveryId}/upload`,
      { fileName, contentType: 'image/jpeg' }
    ).then(r => r.data)

    await uploadFile(uploadUrl, tempFilePath)
    results.push({ cdnUrl, thumbnailUrl, fileName })

    if (onProgress) onProgress(i + 1, files.length)
  }

  return results
}

async function finalizeDelivery(deliveryId) {
  const res = await post(`/admin/delivery/${deliveryId}/finalize`)
  return res.data // { downloadUrl, expiresAt }
}

module.exports = {
  getDelivery,
  togglePhotoSelection,
  adminCreateDelivery,
  uploadDeliveryPhotos,
  finalizeDelivery,
}
