const { formatDate } = require('../../../utils/date')

const MAX_BAR_HEIGHT = 160  // rpx

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    monthLabel: '',
    currentTotal: 0,
    records: [],
    chartMonths: [],
    loading: false,
  },

  onLoad() {
    this._load()
  },

  _monthStr() {
    const { currentYear, currentMonth } = this.data
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  },

  async _load() {
    this.setData({ loading: true })
    const month = this._monthStr()
    const { currentYear, currentMonth } = this.data
    this.setData({ monthLabel: `${currentYear}年${currentMonth}月` })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getIncomeByMonth',
        data: { month },
      })
      if (!res.result.success) {
        wx.showToast({ title: '加载失败', icon: 'none' })
        return
      }

      const { currentRecords, currentTotal, monthTotals } = res.result

      // 计算柱状图每根柱子的高度（相对于最大值）
      const maxTotal = Math.max(...monthTotals.map(m => m.total), 1)
      const chartMonths = monthTotals.map(m => ({
        ...m,
        barHeight: m.total > 0 ? Math.max(8, Math.round((m.total / maxTotal) * MAX_BAR_HEIGHT)) : 0,
        isCurrentMonth: m.key === month,
      }))

      this.setData({ records: currentRecords, currentTotal, chartMonths })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    if (--currentMonth < 1) { currentMonth = 12; currentYear-- }
    this.setData({ currentYear, currentMonth })
    this._load()
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    if (++currentMonth > 12) { currentMonth = 1; currentYear++ }
    this.setData({ currentYear, currentMonth })
    this._load()
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/admin-order-detail/admin-order-detail?bookingId=${id}` })
  },

  goBack() {
    wx.navigateBack()
  },
})
