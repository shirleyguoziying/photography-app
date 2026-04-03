const ENV = 'dev' // 'dev' | 'staging' | 'prod'

const BASE_URLS = {
  dev: 'https://dev-api.yourphotography.com',
  staging: 'https://staging-api.yourphotography.com',
  prod: 'https://api.yourphotography.com',
}

const CDN_URLS = {
  dev: 'https://dev-cdn.yourphotography.com',
  staging: 'https://staging-cdn.yourphotography.com',
  prod: 'https://cdn.yourphotography.com',
}

module.exports = {
  BASE_URL: BASE_URLS[ENV],
  CDN_URL: CDN_URLS[ENV],
  API_PREFIX: '/api/v1',

  // WeChat subscribe message template IDs (register in MP backend)
  TMPL_SHOOT_REMINDER: 'your-template-id-here',
  TMPL_ORDER_CONFIRMED: 'your-template-id-here-2',
  TMPL_DELIVERY_READY: 'your-template-id-here-3',
}
