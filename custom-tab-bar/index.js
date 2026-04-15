const TABS_USER = [
  { path: 'pages/home/home', label: '首页', icon: '🏠', activeIcon: '🏠' },
  { path: 'pages/profile/profile', label: '我的', icon: '👤', activeIcon: '👤' }
]

const TABS_ADMIN = [
  { path: 'pages/admin/admin-home/admin-home', label: '工作台', icon: '💼', activeIcon: '💼' },
  { path: 'pages/admin/admin-my/admin-my', label: '我的', icon: '👤', activeIcon: '👤' }
]

Component({
  data: {
    tabs: TABS_USER,
    selected: 'pages/home/home',
    safeBottom: 0,
    isAdmin: false
  },

  lifetimes: {
    attached() {
      this._updateTabs()
    }
  },

  pageLifetimes: {
    show() {
      this._updateTabs()
    }
  },

  methods: {
    _updateTabs() {
      try {
        const app = getApp()
        const isAdmin = app.globalData.role === 'admin'
        const currentTabs = isAdmin ? TABS_ADMIN : TABS_USER
        const currentSelected = isAdmin ? 'pages/admin/admin-home/admin-home' : 'pages/home/home'
        
        this.setData({
          tabs: currentTabs,
          selected: currentSelected,
          safeBottom: wx.getWindowInfo?.()?.safeAreaInsets?.bottom || 0,
          isAdmin
        })
      } catch (e) {
        console.error('TabBar update error:', e)
      }
    },

    switchTab(e) {
      const path = e.currentTarget.dataset.path
      const url = `/${path}`
      
      if (path.startsWith('pages/admin/')) {
        wx.navigateTo({ url })
      } else {
        wx.switchTab({ url })
      }
    },

    setSelected(path) {
      try {
        const app = getApp()
        const isAdmin = app.globalData.role === 'admin'
        this.setData({ 
          selected: path,
          tabs: isAdmin ? TABS_ADMIN : TABS_USER
        })
      } catch (e) {
        console.error('setSelected error:', e)
      }
    }
  }
})