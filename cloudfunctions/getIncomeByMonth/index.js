// 云函数：查询某月收入记录 + 近6个月柱状图数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const db = cloud.database()
  const { month } = event  // "YYYY-MM"
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: 'invalid month' }
  }

  try {
    // 查询所有已完成的预约（含收入字段）
    const result = await db.collection('bookings')
      .where({ status: 'completed' })
      .limit(500)
      .get()

    const withIncome = result.data.filter(b => b.income != null && b.income.amount != null)

    // 计算近6个月的月份列表
    const [y, m] = month.split('-').map(Number)
    const chartMonths = []
    for (let i = 5; i >= 0; i--) {
      let mm = m - i
      let yy = y
      while (mm <= 0) { mm += 12; yy-- }
      chartMonths.push(`${yy}-${String(mm).padStart(2, '0')}`)
    }

    // 当前月明细
    const currentRecords = withIncome
      .filter(b => (b.preferredDate || '').startsWith(month))
      .sort((a, b) => (b.preferredDate || '').localeCompare(a.preferredDate || ''))
      .map(b => ({
        _id: b._id,
        preferredDate: b.preferredDate || '',
        clientName: b.clientName || '客户',
        characterName: b.props?.characterName || '',
        locationName: b.location?.name || '',
        incomeAmount: Number(b.income.amount) || 0,
        incomeNote: b.income.note || '',
      }))

    const currentTotal = currentRecords.reduce((s, r) => s + r.incomeAmount, 0)

    // 近6个月汇总（用于柱状图）
    const monthTotals = chartMonths.map(key => {
      const total = withIncome
        .filter(b => (b.preferredDate || '').startsWith(key))
        .reduce((s, b) => s + (Number(b.income?.amount) || 0), 0)
      const [, mm] = key.split('-').map(Number)
      return { key, label: `${mm}月`, total }
    })

    return { success: true, currentRecords, currentTotal, monthTotals }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
