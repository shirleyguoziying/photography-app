Component({
  properties: {
    item: { type: Object, value: {} },
    size: { type: String, value: 'medium' }, // 'small' | 'medium' | 'large'
    showOverlay: { type: Boolean, value: true },
    showBadge: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { item: this.properties.item })
    }
  }
})
