const { post } = require('../utils/request')

/**
 * Generate an AI shoot planning proposal based on booking details.
 *
 * Currently returns a mock response.
 * Future: POST /ai/shoot-plan → call Claude/Qianwen API on server side.
 *
 * @param {string} bookingId
 * @returns {Promise<AiShootPlan>}
 */
async function generateShootPlan(bookingId) {
  try {
    const res = await post('/ai/shoot-plan', { bookingId })
    return res.data
  } catch (err) {
    // Fallback to mock if API not available
    console.warn('AI API unavailable, using mock plan')
    return _mockPlan()
  }
}

function _mockPlan() {
  return {
    scenes: [
      {
        index: 1,
        title: '黄金时刻开场',
        location: '主拍摄地点正门',
        time: '拍摄开始后 0-20 分钟',
        lighting: '顺光，利用自然光',
        poses: ['走动中的自然回眸', '倚靠建筑物的轻松姿态'],
        notes: '此时光线最柔和，优先拍摄主要人像',
      },
      {
        index: 2,
        title: '细节道具特写',
        location: '同一区域',
        time: '20-35 分钟',
        lighting: '散射光或轻补光',
        poses: ['道具手持特写', '局部细节（首饰、花束等）'],
        notes: '建立视觉故事线，后期可作为相册过渡页',
      },
      {
        index: 3,
        title: '环境全景互动',
        location: '场地开阔区域',
        time: '35-55 分钟',
        lighting: '逆光拍剪影 / 环境光',
        poses: ['与环境互动的全身照', '行走中抓拍'],
        notes: '展现场景氛围感，注意构图留白',
      },
      {
        index: 4,
        title: '收尾情绪特写',
        location: '最具特色的一处场景',
        time: '最后 20 分钟',
        lighting: '与开场呼应',
        poses: ['眼神特写', '情绪化表情'],
        notes: '拍摄疲惫度最高时，可播放轻音乐放松',
      },
    ],
    timeline: [
      { time: 'T+0', task: '到达集合，沟通当日流程' },
      { time: 'T+5', task: '妆造检查，试拍测光' },
      { time: 'T+10', task: '场景一正式拍摄' },
      { time: 'T+30', task: '移动至场景二' },
      { time: 'T+60', task: '中场休息 5 分钟，查看实时预览' },
      { time: 'T+65', task: '场景三拍摄' },
      { time: 'T+90', task: '收尾拍摄 + 备用补拍' },
      { time: 'T+110', task: '拍摄结束，整理器材' },
    ],
    tips: [
      '提前踩点确认光线方向，最佳光线通常在上午 9-11 点或下午 4-6 点',
      '建议客户当天少吃，避免状态不佳',
      '准备一套备用服装，以防主服装不适合某场景',
      '提前与客户分享参考图，统一审美预期',
      '遇到云层时善用散射光，避免硬阴影',
    ],
    generatedAt: new Date().toISOString(),
    isAiGenerated: false, // true when real AI is used
  }
}

module.exports = { generateShootPlan }
