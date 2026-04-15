const storage = require('../utils/storage')

/**
 * Generate an AI shoot planning proposal based on booking details.
 * 
 * @param {string} bookingId
 * @returns {Promise<AiShootPlan>}
 */
async function generateShootPlan(bookingId) {
  try {
    // 从本地存储获取预约信息
    const draft = storage.getBookingDraft()
    if (draft && draft.formData) {
      return _generatePlanFromFormData(draft.formData)
    }
    return _mockPlan()
  } catch (err) {
    console.warn('Generate plan failed, using mock plan', err)
    return _mockPlan()
  }
}

/**
 * 根据表单数据生成个性化的拍摄策划
 */
function _generatePlanFromFormData(formData) {
  const { props, stylePreferences, location, preferredDate, preferredTime, duration } = formData
  const characterName = props?.characterName || '角色'
  const locationName = location?.name || '拍摄地点'
  const shootPreference = stylePreferences?.shootPreference || 'mixed'
  
  // 根据拍摄偏好生成核心主题
  const theme = _generateCoreTheme(characterName, locationName, shootPreference)
  
  // 生成服装与道具建议
  const costumeProps = _generateCostumeProps(characterName, shootPreference)
  
  // 生成拍摄角度与姿势
  const posesAngles = _generatePosesAngles(shootPreference, characterName)
  
  // 生成场景布置建议
  const sceneSetup = _generateSceneSetup(locationName, characterName, shootPreference)
  
  return {
    coreTheme: theme,
    costumeProps: costumeProps,
    posesAngles: posesAngles,
    sceneSetup: sceneSetup,
    generatedAt: new Date().toISOString(),
    isAiGenerated: true,
    // 保留原有字段以兼容
    scenes: _generateScenes(characterName, locationName, duration),
    timeline: _generateTimeline(duration),
    tips: _generateTips(characterName)
  }
}

/**
 * 生成核心主题
 */
function _generateCoreTheme(characterName, locationName, shootPreference) {
  const styleMap = {
    'closeup': '特写向',
    'halfbody': '半身向',
    'wideshot': '全景向',
    'atmosphere': '氛围感',
    'mixed': '综合向'
  }
  const style = styleMap[shootPreference] || '综合向'
  return `${characterName}·${locationName}·${style}拍摄`
}

/**
 * 生成服装与道具建议
 */
function _generateCostumeProps(characterName, shootPreference) {
  const suggestions = []
  const props = []
  
  // 根据角色名提供常见的服装建议
  if (characterName.includes('雷电') || characterName.includes('将军')) {
    suggestions.push({
      name: '雷电将军常服',
      note: '展现角色威严气质'
    })
    suggestions.push({
      name: '雷电将军战斗服',
      note: '适合动态拍摄'
    })
    props.push({ name: '薙刀模型', photographerCanProvide: false })
    props.push({ name: '紫色发饰', photographerCanProvide: true })
    props.push({ name: '雷电元素道具', photographerCanProvide: false })
  } else if (characterName.includes('神里') || characterName.includes('绫华')) {
    suggestions.push({
      name: '神里绫华和服',
      note: '优雅端庄'
    })
    suggestions.push({
      name: '神里绫华常服',
      note: '日常可爱'
    })
    props.push({ name: '扇子', photographerCanProvide: true })
    props.push({ name: '樱花装饰', photographerCanProvide: true })
  } else {
    suggestions.push({
      name: `${characterName}常服`,
      note: '展现角色日常一面'
    })
    suggestions.push({
      name: `${characterName}战斗服/特殊服装`,
      note: '突出角色特色'
    })
    props.push({ name: '角色标志性道具', photographerCanProvide: false })
    props.push({ name: '角色发饰', photographerCanProvide: true })
  }
  
  return {
    costumeSuggestions: suggestions,
    propSuggestions: props
  }
}

/**
 * 生成拍摄角度与姿势
 */
function _generatePosesAngles(shootPreference, characterName) {
  const poses = []
  const angles = []
  
  // 根据角色特性生成姿势
  if (characterName.includes('雷电') || characterName.includes('将军')) {
    poses.push('站姿持道具，眼神凌厉，展现威严气场')
    poses.push('坐姿托腮，眼神柔和，展现反差萌')
    poses.push('侧身回头，发丝飘动，动态感十足')
    poses.push('双手抱胸，冷傲表情，突出角色性格')
    poses.push('半蹲姿势，手持道具蓄力，战斗感')
  } else {
    poses.push('站姿自然，眼神望向镜头，展现角色全貌')
    poses.push('坐姿放松，手托下巴，萌系表情')
    poses.push('侧身回眸，发丝飘动，动态美感')
    poses.push('倚靠道具/墙壁，慵懒姿态')
  }
  
  // 根据拍摄偏好生成角度
  if (shootPreference === 'closeup') {
    angles.push('特写面部，突出妆容细节和眼神')
    angles.push('肩部以上特写，展现表情变化')
  } else if (shootPreference === 'wideshot') {
    angles.push('全身远景，展现角色整体造型与环境融合')
    angles.push('中景全身，兼顾环境与人物')
  } else {
    angles.push('全身远景，展现角色整体造型')
    angles.push('特写面部，突出妆容细节')
    angles.push('半身照，捕捉表情与姿态')
  }
  
  return {
    poses: poses.slice(0, 5),
    angles: angles.slice(0, 3)
  }
}

/**
 * 生成场景布置建议
 */
function _generateSceneSetup(locationName, characterName, shootPreference) {
  const suggestions = []
  
  if (locationName.includes('棚') || locationName.includes('室内')) {
    if (characterName.includes('雷电') || characterName.includes('将军')) {
      suggestions.push('室内棚拍可搭配暗色系背景，点缀紫色/蓝色灯光，还原雷电将军气场')
      suggestions.push('使用烟雾机营造神秘感，配合侧光突出轮廓')
    } else {
      suggestions.push(`室内棚拍可搭配与${characterName}色系相近的背景`)
      suggestions.push('使用柔和的补光，营造舒适的拍摄氛围')
    }
  } else {
    suggestions.push(`利用${locationName}的自然景观作为背景`)
    suggestions.push('注意避开杂乱的背景元素，保持画面干净')
    suggestions.push('根据光线方向调整拍摄位置，善用自然光')
  }
  
  return suggestions
}

/**
 * 生成场景规划（兼容原有格式）
 */
function _generateScenes(characterName, locationName, duration) {
  return [
    {
      index: 1,
      title: '开场定妆照',
      location: locationName,
      time: '拍摄开始后 0-20 分钟',
      lighting: '顺光，利用自然光',
      poses: ['正面全身照，展现角色全貌', '侧面特写，突出轮廓'],
      notes: '先拍摄几张定妆照，找到最佳状态'
    },
    {
      index: 2,
      title: '表情与细节',
      location: locationName,
      time: '20-40 分钟',
      lighting: '散射光或轻补光',
      poses: ['表情特写', '道具手持特写', '发丝细节'],
      notes: '捕捉角色的表情变化和细节'
    },
    {
      index: 3,
      title: '动态与氛围',
      location: locationName,
      time: '40-60 分钟',
      lighting: '侧光或逆光',
      poses: ['走动中抓拍', '回眸瞬间', '与环境互动'],
      notes: '营造氛围感，注意构图留白'
    }
  ]
}

/**
 * 生成时间轴（兼容原有格式）
 */
function _generateTimeline(duration) {
  const dur = duration || 2
  return [
    { time: 'T+0', task: '到达集合，沟通当日流程' },
    { time: 'T+5', task: '妆造检查，试拍测光' },
    { time: 'T+10', task: '开场定妆照拍摄' },
    { time: 'T+30', task: '表情与细节拍摄' },
    { time: `T+${dur * 30}`, task: '动态与氛围拍摄' },
    { time: `T+${dur * 50}`, task: '中场休息，查看预览' },
    { time: `T+${dur * 55}`, task: '补拍与自由创作' },
    { time: `T+${dur * 60}`, task: '拍摄结束，整理器材' }
  ]
}

/**
 * 生成拍摄建议（兼容原有格式）
 */
function _generateTips(characterName) {
  return [
    `提前与客户沟通${characterName}的人设特点，统一拍摄风格`,
    '建议客户拍摄前一晚保证充足睡眠，避免水肿',
    '准备好补妆用品，随时补妆保持最佳状态',
    '拍摄过程中多与客户互动，让客户放松自然',
    '多拍不同角度和表情，给后期更多选择空间'
  ]
}

/**
 * 模拟策划（后备方案）
 */
function _mockPlan() {
  return {
    coreTheme: '原神雷电将军·室内棚拍·还原向拍摄',
    costumeProps: {
      costumeSuggestions: [
        { name: '雷电将军常服', note: '展现角色威严气质' },
        { name: '雷电将军战斗服', note: '适合动态拍摄' }
      ],
      propSuggestions: [
        { name: '薙刀模型', photographerCanProvide: false },
        { name: '紫色发饰', photographerCanProvide: true }
      ]
    },
    posesAngles: {
      poses: [
        '站姿持道具，眼神凌厉，展现威严气场',
        '坐姿托腮，眼神柔和，展现反差萌',
        '侧身回头，发丝飘动，动态感十足',
        '双手抱胸，冷傲表情，突出角色性格',
        '半蹲姿势，手持道具蓄力，战斗感'
      ],
      angles: [
        '全身远景，展现角色整体造型',
        '特写面部，突出妆容细节',
        '半身照，捕捉表情与姿态'
      ]
    },
    sceneSetup: [
      '室内棚拍可搭配暗色系背景，点缀紫色/蓝色灯光，还原雷电将军气场',
      '使用烟雾机营造神秘感，配合侧光突出轮廓'
    ],
    scenes: [
      {
        index: 1,
        title: '开场定妆照',
        location: '室内棚拍',
        time: '拍摄开始后 0-20 分钟',
        lighting: '顺光，利用自然光',
        poses: ['正面全身照，展现角色全貌', '侧面特写，突出轮廓'],
        notes: '先拍摄几张定妆照，找到最佳状态'
      },
      {
        index: 2,
        title: '表情与细节',
        location: '室内棚拍',
        time: '20-40 分钟',
        lighting: '散射光或轻补光',
        poses: ['表情特写', '道具手持特写', '发丝细节'],
        notes: '捕捉角色的表情变化和细节'
      }
    ],
    timeline: [
      { time: 'T+0', task: '到达集合，沟通当日流程' },
      { time: 'T+5', task: '妆造检查，试拍测光' },
      { time: 'T+10', task: '开场定妆照拍摄' },
      { time: 'T+30', task: '表情与细节拍摄' },
      { time: 'T+60', task: '拍摄结束，整理器材' }
    ],
    tips: [
      '提前与客户沟通角色人设特点，统一拍摄风格',
      '建议客户拍摄前一晚保证充足睡眠',
      '准备好补妆用品，随时补妆保持最佳状态'
    ],
    generatedAt: new Date().toISOString(),
    isAiGenerated: true
  }
}

module.exports = { generateShootPlan }
