const { getMonthDays, formatDate } = require('../../../utils/date')

// 状态中文映射
const STATUS_LABEL = {
  pending: '待确认',
  confirmed: '已确认',
  shooting_today: '今日拍摄',
  post_processing: '后期处理中',
  delivered: '已交付',
  completed: '已完成',
  cancelled: '已取消',
}

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    scheduleMap: {}, // { 'YYYY-MM-DD': [booking, ...] }
    selectedDate: formatDate(new Date()),
    selectedDayOrders: [],
    isLoading: false,
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setSelected('pages/admin/admin-calendar/admin-calendar')
    }
  },

  onLoad() {
    this._buildCalendar()
    this._loadSchedule()
  },

  _buildCalendar() {
    const { currentYear, currentMonth } = this.data
    this.setData({ calendarDays: getMonthDays(currentYear, currentMonth) })
  },

  async _loadSchedule() {
    const { currentYear, currentMonth } = this.data
    const month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
    this.setData({ isLoading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getBookingsByMonth',
        data: { month },
      })
      const { success, scheduleMap = {} } = res.result
      if (success) {
        this.setData({ scheduleMap })
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络异常', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
      this._updateSelectedDay()
    }
  },

  _updateSelectedDay() {
    const { selectedDate, scheduleMap } = this.data
    const orders = (scheduleMap[selectedDate] || []).map((item) => ({
      ...item,
      statusLabel: STATUS_LABEL[item.status] || item.status,
    }))
    this.setData({ selectedDayOrders: orders })
  },

  onDayTap(e) {
    const { date } = e.currentTarget.dataset
    if (!date) return
    this.setData({ selectedDate: date })
    this._updateSelectedDay()
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) { currentMonth = 12; currentYear-- }
    this.setData({ currentYear, currentMonth })
    this._buildCalendar()
    this._loadSchedule()
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) { currentMonth = 1; currentYear++ }
    this.setData({ currentYear, currentMonth })
    this._buildCalendar()
    this._loadSchedule()
  },

  goToOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin/admin-order-detail/admin-order-detail?orderId=${orderId}`,
    })
  },
})
