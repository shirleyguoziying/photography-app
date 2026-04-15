/**
 * 定时触发云函数：每天早上8点发送拍摄提醒
 *
 * 设置定时触发器（在微信开发者工具中操作）：
 *   云函数 → sendDailyReminder → 触发器 → 添加
 *   Cron 表达式: 0 0 8 * * * *   （每天8:00:00 UTC+8）
 *
 * 提醒逻辑：
 *   1. 查询明天所有 status=pending 或 confirmed 的预约
 *   2. 向每个预约的用户（_openid）发送一条订阅消息
 *   3. 向摄影师（ADMIN_OPENID）发送今日拍摄汇总
 *
 * 使用前需在微信公众平台注册订阅消息模板，将模板ID填入下方常量。
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// ⚠️ 替换为你的 openid（摄影师）
const ADMIN_OPENID = 'osZ5K14xjgiHQLY2UCCvT5VtAoVQ'

// ⚠️ 在微信公众平台 → 功能 → 订阅消息 中申请模板，替换下面两个 ID
// 用户侧模板：拍摄提醒（建议使用"服务提醒"类模板，含时间、地点、备注字段）
const TMPL_USER_REMINDER = 'YOUR_USER_TEMPLATE_ID'
// 摄影师侧模板：今日拍摄汇总（含客户数、时间段字段）
const TMPL_PHOTOGRAPHER_REMINDER = 'YOUR_PHOTOGRAPHER_TEMPLATE_ID'

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

exports.main = async () => {
  const db = cloud.database()
  const _ = db.command
  const tomorrow = tomorrowStr()
  const results = { sent: 0, failed: 0, skipped: 0 }

  try {
    // 查询明天的所有有效预约
    const { data: bookings } = await db.collection('bookings')
      .where({
        preferredDate: tomorrow,
        status: _.in(['pending', 'confirmed']),
      })
      .get()

    if (bookings.length === 0) {
      return { success: true, message: '明天无预约，无需发送提醒', results }
    }

    // 1. 给每位用户发送拍摄提醒
    for (const booking of bookings) {
      const userOpenid = booking._openid
      if (!userOpenid) { results.skipped++; continue }

      try {
        await cloud.openapi.subscribeMessage.send({
          touser: userOpenid,
          templateId: TMPL_USER_REMINDER,
          // ⚠️ data 字段名称需与你注册的模板一致，以下为示例
          data: {
            thing1: { value: booking.preferredDate },      // 拍摄日期
            time2: { value: booking.preferredTime },        // 拍摄时间
            thing3: { value: booking.location?.name || '待定' }, // 拍摄地点
            thing4: { value: booking.props?.characterName || '' }, // 角色名
            thing5: { value: '请准时到达，期待与您的合作！' },
          },
        })
        results.sent++
      } catch (e) {
        // 用户未订阅或订阅已用完，正常情况
        results.failed++
      }
    }

    // 2. 给摄影师发送今日拍摄汇总（摄影师需在小程序内提前订阅）
    const summary = bookings
      .map(b => `${b.preferredTime} ${b.clientName} ${b.props?.characterName || ''}`)
      .join('；')

    try {
      await cloud.openapi.subscribeMessage.send({
        touser: ADMIN_OPENID,
        templateId: TMPL_PHOTOGRAPHER_REMINDER,
        data: {
          thing1: { value: tomorrow },
          number2: { value: String(bookings.length) },
          thing3: { value: summary.slice(0, 20) + (summary.length > 20 ? '...' : '') },
          thing4: { value: '请做好拍摄准备' },
        },
      })
    } catch (e) {
      // 摄影师未订阅当天提醒
    }

    return { success: true, tomorrow, bookingCount: bookings.length, results }
  } catch (err) {
    return { success: false, error: err.message, results }
  }
}
