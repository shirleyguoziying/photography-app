const { get, put } = require('../utils/request')

async function getProfile() {
  const res = await get('/users/me')
  return res.data
}

async function updateProfile(data) {
  const res = await put('/users/me', data)
  // Sync updated user to globalData
  const app = getApp()
  app.globalData.user = { ...app.globalData.user, ...res.data }
  return res.data
}

module.exports = { getProfile, updateProfile }
