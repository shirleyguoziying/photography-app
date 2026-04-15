const { formatDate } = require('../../../utils/date')

const HOUR_HEIGHT = 80   // rpx per hour
const START_HOUR = 8
const END_HOUR = 22
const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六']
const HOURS = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

function getWeekStart(dateStr) {
  const d = new Date(dateStr)
  const dow = d.getDay()             // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow  // shift to Monday
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

function parseHour(timeStr) {
  // "HH:MM" → decimal hours, e.g. "09:30" → 9.5
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

function buildWeekDays(weekStart, scheduleMap, today) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)
    const d = new Date(date)
    const rawBookings = scheduleMap[date] || []

    const bookings = rawBookings
      .filter(b => b.shootTime)   // 只渲染有时间的预约
      .map(b => {
        const startH = parseHour(b.shootTime) ?? START_HOUR
        const dur = b.duration || 1
        const clampedStart = Math.max(START_HOUR, Math.min(startH, END_HOUR - 0.5))
        const clampedDur = Math.min(dur, END_HOUR - clampedStart)
        const topRpx = Math.round((clampedStart - START_HOUR) * HOUR_HEIGHT)
        const heightRpx = Math.max(40, Math.round(clampedDur * HOUR_HEIGHT))
        return { ...b, topRpx, heightRpx }
      })

    days.push({
      date,
      day: d.getDate(),
      weekday: WEEKDAY_CN[d.getDay()],
      isToday: date === today,
      bookings,
    })
  }
  return days
}

Page({
  data: {
    weekStart: '',
    weekLabel: '',
    weekDays: [],
    hours: HOURS,
    isLoading: false,
    gridHeight: 700,   // 默认值，onLoad 后用屏幕高度覆盖
  },

  onLoad() {
    // 计算时间轴可用高度
    wx.getSystemInfo({
      success: (res) => {
        const ratio = 750 / res.windowWidth
        // 固定头部：back-bar(44rpx) + week-nav(52rpx) + day-header(60rpx) ≈ 156rpx
        // 底部 tab-bar ≈ 50px
        const gridHeight = Math.round((res.windowHeight - 50) * ratio) - 156
        this.setData({ gridHeight: Math.max(400, gridHeight) })
      }
    })

    const today = formatDate(new Date())
    this._loadWeek(getWeekStart(today))
  },

  onShow() {
    const tabBar = this.getTabBar?.()
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected('pages/admin/admin-calendar/admin-calendar')
    }
    if (this.data.weekStart) {
      this._loadWeek(this.data.weekStart)
    }
  },

  async _loadWeek(weekStart) {
    this.setData({ isLoading: true })
    const today = formatDate(new Date())
    const weekEnd = addDays(weekStart, 6)

    // 跨月时需要同时查询两个月份
    const startMonth = weekStart.slice(0, 7)
    const endMonth = weekEnd.slice(0, 7)
    const months = startMonth === endMonth ? [startMonth] : [startMonth, endMonth]

    try {
      const results = await Promise.all(
        months.map(m => wx.cloud.callFunction({ name: 'getBookingsByMonth', data: { month: m } }))
      )

      const scheduleMap = {}
      results.forEach(res => {
        if (res.result?.success) Object.assign(scheduleMap, res.result.scheduleMap)
      })

      const weekDays = buildWeekDays(weekStart, scheduleMap, today)
      const weekLabel = this._weekLabel(weekStart, weekEnd)
      this.setData({ weekDays, weekLabel, weekStart })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  _weekLabel(start, end) {
    const fmt = s => {
      const d = new Date(s)
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }
    return `${fmt(start)} — ${fmt(end)}`
  },

  prevWeek() {
    this._loadWeek(addDays(this.data.weekStart, -7))
  },

  nextWeek() {
    this._loadWeek(addDays(this.data.weekStart, 7))
  },

  onBlockTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?bookingId=${id}` })
  },

  goBack() {
    wx.navigateTo({ url: '/pages/admin/admin-home/admin-home' })
  },
})
