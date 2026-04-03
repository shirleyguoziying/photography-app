const { BASE_URL, API_PREFIX } = require('../config/api')
const storage = require('./storage')

let _isRefreshing = false
let _pendingQueue = []

function flushQueue(token) {
  _pendingQueue.forEach(({ resolve, reject, options }) => {
    options.header = options.header || {}
    options.header['Authorization'] = `Bearer ${token}`
    doRequest(options).then(resolve).catch(reject)
  })
  _pendingQueue = []
}

function doRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject({ statusCode: res.statusCode, data: res.data })
        }
      },
      fail(err) {
        reject({ statusCode: 0, message: err.errMsg || '网络请求失败' })
      }
    })
  })
}

async function refreshToken() {
  const token = storage.getToken()
  const res = await doRequest({
    url: `${BASE_URL}${API_PREFIX}/auth/refresh`,
    method: 'POST',
    header: { Authorization: `Bearer ${token}` },
  })
  const newToken = res.data.token
  storage.setToken(newToken)
  getApp().globalData.token = newToken
  return newToken
}

/**
 * Main request function
 * @param {string} path - API path (e.g. '/users/me')
 * @param {object} options - { method, data, header }
 */
async function request(path, options = {}) {
  const token = storage.getToken()
  const url = `${BASE_URL}${API_PREFIX}${path}`

  const reqOptions = {
    url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...options.header,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  try {
    return await doRequest(reqOptions)
  } catch (err) {
    if (err.statusCode === 401) {
      // Token expired — refresh once
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject, options: reqOptions })
        })
      }
      _isRefreshing = true
      try {
        const newToken = await refreshToken()
        _isRefreshing = false
        flushQueue(newToken)
        reqOptions.header['Authorization'] = `Bearer ${newToken}`
        return await doRequest(reqOptions)
      } catch (refreshErr) {
        _isRefreshing = false
        _pendingQueue = []
        getApp().onLogout()
        throw refreshErr
      }
    }

    // Show toast for non-auth errors
    const msg = err.data?.message || '请求失败，请稍后重试'
    wx.showToast({ title: msg, icon: 'none', duration: 2000 })
    throw err
  }
}

// Convenience helpers
const get = (path, params, options = {}) =>
  request(path, { method: 'GET', data: params, ...options })

const post = (path, data, options = {}) =>
  request(path, { method: 'POST', data, ...options })

const put = (path, data, options = {}) =>
  request(path, { method: 'PUT', data, ...options })

const patch = (path, data, options = {}) =>
  request(path, { method: 'PATCH', data, ...options })

const del = (path, options = {}) =>
  request(path, { method: 'DELETE', ...options })

/**
 * Upload file to a pre-signed URL (direct to OSS/COS)
 */
function uploadFile(signedUrl, filePath, formData = {}) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: signedUrl,
      filePath,
      name: 'file',
      formData,
      success(res) {
        if (res.statusCode === 200) {
          resolve(JSON.parse(res.data))
        } else {
          reject({ statusCode: res.statusCode })
        }
      },
      fail(err) {
        reject({ message: err.errMsg })
      }
    })
  })
}

module.exports = { request, get, post, put, patch, del, uploadFile }
