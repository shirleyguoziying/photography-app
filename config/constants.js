// Order lifecycle statuses
const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  SHOOTING_TODAY: 'shooting_today',
  POST_PROCESSING: 'post_processing',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: '待确认',
  [ORDER_STATUS.CONFIRMED]: '已确认',
  [ORDER_STATUS.SHOOTING_TODAY]: '今日拍摄',
  [ORDER_STATUS.POST_PROCESSING]: '后期处理中',
  [ORDER_STATUS.DELIVERED]: '客片已发送',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
}

const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.PENDING_CONFIRMATION]: '#faad14',
  [ORDER_STATUS.CONFIRMED]: '#1890ff',
  [ORDER_STATUS.SHOOTING_TODAY]: '#722ed1',
  [ORDER_STATUS.POST_PROCESSING]: '#fa8c16',
  [ORDER_STATUS.DELIVERED]: '#52c41a',
  [ORDER_STATUS.COMPLETED]: '#52c41a',
  [ORDER_STATUS.CANCELLED]: '#999999',
}

// Booking multi-step questionnaire steps
const BOOKING_STEPS = [
  { index: 0, label: '时间', icon: 'calendar' },
  { index: 1, label: '地点', icon: 'location' },
  { index: 2, label: '道具', icon: 'star' },
  { index: 3, label: '风格', icon: 'palette' },
]

// Photography style tags
const STYLE_TAGS = [
  '胶片风', '自然光', '人像写真', '婚纱礼服', '日系清新',
  '复古暗调', '儿童写真', '商业大片', '旅拍', '情侣写真',
  '艺术概念', '生活方式',
]

// Shoot duration options (hours)
const DURATION_OPTIONS = [
  { value: 1, label: '1小时' },
  { value: 2, label: '2小时' },
  { value: 3, label: '3小时' },
  { value: 4, label: '半天（4小时）' },
  { value: 8, label: '全天（8小时）' },
]

// Props/outfit options
const PROPS_OPTIONS = [
  { key: 'flowers', label: '花束' },
  { key: 'balloon', label: '气球' },
  { key: 'umbrella', label: '雨伞' },
  { key: 'hat', label: '帽子' },
  { key: 'book', label: '书本' },
  { key: 'bike', label: '自行车' },
  { key: 'film_camera', label: '胶片相机' },
  { key: 'vintage_items', label: '复古小物' },
]

// Mood/tone options for style step
const MOOD_OPTIONS = [
  { value: 'fresh', label: '清新自然' },
  { value: 'romantic', label: '浪漫梦幻' },
  { value: 'moody', label: '复古暗调' },
  { value: 'bright', label: '明亮活泼' },
  { value: 'artistic', label: '艺术概念' },
  { value: 'documentary', label: '纪实自然' },
]

// Payment status
const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
}

// Delivery status
const DELIVERY_STATUS = {
  PENDING_UPLOAD: 'pending_upload',
  UPLOADED: 'uploaded',
  CLIENT_SELECTING: 'client_selecting',
  FINALIZED: 'finalized',
}

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  BOOKING_STEPS,
  STYLE_TAGS,
  DURATION_OPTIONS,
  PROPS_OPTIONS,
  MOOD_OPTIONS,
  PAYMENT_STATUS,
  DELIVERY_STATUS,
}
