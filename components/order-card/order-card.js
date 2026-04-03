Component({
  properties: {
    item: { type: Object, value: {} },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { item: this.properties.item })
    }
  }
})
