const USER_TABS = [
  { path: 'pages/home/home', label: '首页', icon: '/assets/icons/home.png', activeIcon: '/assets/icons/home-active.png' },
  { path: 'pages/booking/booking', label: '预约', icon: '/assets/icons/booking.png', activeIcon: '/assets/icons/booking-active.png' },
  { path: 'pages/orders/orders', label: '订单', icon: '/assets/icons/orders.png', activeIcon: '/assets/icons/orders-active.png' },
  { path: 'pages/profile/profile', label: '我的', icon: '/assets/icons/profile.png', activeIcon: '/assets/icons/profile-active.png' },
]

const ADMIN_TABS = [
  { path: 'pages/admin/admin-home/admin-home', label: '工作台', icon: '/assets/icons/home.png', activeIcon: '/assets/icons/home-active.png' },
  { path: 'pages/admin/admin-calendar/admin-calendar', label: '日历', icon: '/assets/icons/booking.png', activeIcon: '/assets/icons/booking-active.png' },
  { path: 'pages/admin/admin-orders/admin-orders', label: '订单', icon: '/assets/icons/orders.png', activeIcon: '/assets/icons/orders-active.png' },
  { path: 'pages/admin/admin-portfolio/admin-portfolio', label: '作品', icon: '/assets/icons/profile.png', activeIcon: '/assets/icons/profile-active.png' },
]

Component({
  data: {
    tabs: USER_TABS,
    selected: 'pages/home/home',
    safeBottom: 0,
  },

  lifetimes: {
    attached() {
      const app = getApp()
      const role = app.globalData.role
      const { safeAreaInsets } = wx.getWindowInfo ? wx.getWindowInfo() : { safeAreaInsets: { bottom: 0 } }
      this.setData({
        tabs: role === 'admin' ? ADMIN_TABS : USER_TABS,
        safeBottom: safeAreaInsets?.bottom || 0,
      })
    }
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path
      wx.switchTab({ url: `/${path}` })
    },

    // Called by each tab page's onShow to highlight correct tab
    setSelected(path) {
      this.setData({ selected: path })
    }
  }
})
