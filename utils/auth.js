const { post } = require('./request')
const storage = require('./storage')

/**
 * Full WeChat login flow:
 * 1. wx.login → code
 * 2. POST /auth/login with code → { token, user }
 * 3. Store token & user, update globalData
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async ({ code }) => {
        try {
          const res = await post('/auth/login', { code })
          const { token, user } = res.data
          storage.setToken(token)
          storage.setUser(user)
          getApp().globalData.token = token
          getApp().globalData.user = user
          getApp().globalData.role = user.role
          resolve({ token, user })
        } catch (err) {
          reject(err)
        }
      },
      fail: reject,
    })
  })
}

/**
 * Bind phone number via WeChat encrypted data
 * Must be triggered from a <button open-type="getPhoneNumber"> event
 */
async function bindPhone(encryptedData, iv, code) {
  const res = await post('/auth/bind-phone', { encryptedData, iv, code })
  // Update cached user with masked phone
  const user = storage.getUser()
  if (user) {
    user.phone = res.data.phone
    storage.setUser(user)
    getApp().globalData.user = user
  }
  return res.data
}

/**
 * Verify stored token is still valid (lightweight check)
 */
async function verifyToken() {
  // GET /users/me — if 401, throws and caller handles redirect
  const { get } = require('./request')
  const res = await get('/users/me')
  return res.data
}

module.exports = { login, bindPhone, verifyToken }
