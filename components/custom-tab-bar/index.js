const TABS = [
  { path: 'pages/home/home', label: '首页', icon: '🏠', activeIcon: '🏠' },
  { path: 'pages/profile/profile', label: '我的', icon: '👤', activeIcon: '👤' }
]

Component({
  data: {
    tabs: TABS,
    selected: 'pages/home/home',
    safeBottom: 0
  },

  lifetimes: {
    attached() {
      const { safeAreaInsets } = wx.getWindowInfo ? wx.getWindowInfo() : { safeAreaInsets: { bottom: 0 } }
      this.setData({
        safeBottom: safeAreaInsets?.bottom || 0
      })
    }
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path
      wx.switchTab({ url: `/${path}` })
    },

    setSelected(path) {
      this.setData({ selected: path })
    }
  }
})
