const { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } = require('../../config/constants')

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

Component({
  properties: {
    status: { type: String, value: '' },
  },
  computed: {}, // No computed support in native MP, use observers
  observers: {
    status(val) {
      const color = ORDER_STATUS_COLOR[val] || '#999999'
      this.setData({
        label: ORDER_STATUS_LABEL[val] || val,
        color,
        bgColor: hexToRgba(color, 0.12),
      })
    }
  },
  data: {
    label: '',
    color: '#999999',
    bgColor: 'rgba(153,153,153,0.12)',
  }
})
