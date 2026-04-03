const auth = require('./utils/auth')
const storage = require('./utils/storage')

App({
  globalData: {
    user: null,
    role: 'user', // 'user' | 'admin'
    token: null,
    systemInfo: null,
  },

  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'cloud1-7gpg93cufb3a4583',
      traceUser: true,
    })
    this._initSystemInfo()
    this._restoreSession()
  },

  _initSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
      }
    })
  },

  async _restoreSession() {
    const token = storage.getToken()
    const user = storage.getUser()

    if (!token || !user) {
      this._redirectToLogin()
      return
    }

    this.globalData.token = token
    this.globalData.user = user
    this.globalData.role = user.role

    // Verify token is still valid
    try {
      await auth.verifyToken(token)
      this._routeByRole(user.role)
    } catch (e) {
      storage.clearSession()
      this._redirectToLogin()
    }
  },

  _routeByRole(role) {
    const targetPage = role === 'admin'
      ? '/pages/admin/admin-home/admin-home'
      : '/pages/home/home'
    wx.switchTab({ url: targetPage })
  },

  _redirectToLogin() {
    wx.reLaunch({ url: '/pages/login/login' })
  },

  // Called after successful login
  onLoginSuccess(user, token) {
    this.globalData.user = user
    this.globalData.token = token
    this.globalData.role = user.role
    storage.setToken(token)
    storage.setUser(user)
    this._routeByRole(user.role)
  },

  // Called after logout
  onLogout() {
    this.globalData.user = null
    this.globalData.token = null
    this.globalData.role = 'user'
    storage.clearSession()
    this._redirectToLogin()
  },

  // Simple event bus for cross-page communication
  bus: {
    _listeners: {},
    on(event, fn) {
      if (!this._listeners[event]) this._listeners[event] = []
      this._listeners[event].push(fn)
    },
    off(event, fn) {
      if (!this._listeners[event]) return
      this._listeners[event] = this._listeners[event].filter(f => f !== fn)
    },
    emit(event, data) {
      if (!this._listeners[event]) return
      this._listeners[event].forEach(fn => fn(data))
    }
  }
})
