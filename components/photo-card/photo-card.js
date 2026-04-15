Component({
  properties: {
    item: { type: Object, value: {} },
    size: { type: String, value: 'medium' },
    showOverlay: { type: Boolean, value: true },
    showBadge: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { item: this.properties.item })
    },
    onStarTap(e) {
      e.stopPropagation()
      this.triggerEvent('startap', { item: this.properties.item })
    }
  }
})
