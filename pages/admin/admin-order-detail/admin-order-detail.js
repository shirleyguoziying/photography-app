Page({
  data: {
    bookingId: null,
    booking: null,
    loading: true,
    isActing: false,
    showNoteInput: false,
    noteValue: '',
    // 收入录入
    showIncomeInput: false,
    incomeAmount: '',
    incomeNote: '',
  },

  async onLoad(options) {
    const bookingId = options.bookingId || options.orderId
    this.setData({ bookingId })
    await this._loadDetail()
  },

  async _loadDetail() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getBookingDetail',
        data: { bookingId: this.data.bookingId },
      })
      if (res.result.success) {
        this.setData({
          booking: res.result.booking,
          noteValue: res.result.booking.photographerNote || '',
        })
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络异常', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  goToDelivery() {
    wx.navigateTo({ url: `/pages/admin/admin-delivery/admin-delivery?bookingId=${this.data.bookingId}` })
  },

  // ===== 确认预约 =====
  confirmBooking() {
    wx.showModal({
      title: '确认接单',
      content: '确定接受此次预约？',
      confirmText: '确认接单',
      success: async (res) => {
        if (!res.confirm) return
        await this._updateStatus('confirmed', '已确认接单')
      },
    })
  },

  // ===== 取消预约 =====
  cancelBooking() {
    wx.showModal({
      title: '取消预约',
      content: '确定取消此次预约吗？',
      confirmText: '确认取消',
      confirmColor: '#ef4444',
      editable: true,
      placeholderText: '取消原因（可选）',
      success: async (res) => {
        if (!res.confirm) return
        await this._updateStatus('cancelled', '预约已取消')
        if (res.content) await this._saveNote(res.content)
      },
    })
  },

  // ===== 标记已完成 → 弹出收入录入 =====
  completeBooking() {
    wx.showModal({
      title: '标记完成',
      content: '确定将此预约标记为已完成？',
      confirmText: '标记完成',
      success: async (res) => {
        if (!res.confirm) return
        const ok = await this._updateStatus('completed', null)
        if (ok) this.setData({ showIncomeInput: true })
      },
    })
  },

  // ===== 收入录入 =====
  onIncomeAmountInput(e) {
    this.setData({ incomeAmount: e.detail.value })
  },

  onIncomeNoteInput(e) {
    this.setData({ incomeNote: e.detail.value })
  },

  skipIncome() {
    wx.showToast({ title: '已标记完成', icon: 'success' })
    this.setData({ showIncomeInput: false, incomeAmount: '', incomeNote: '' })
  },

  async saveIncome() {
    const amount = parseFloat(this.data.incomeAmount)
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateBookingStatus',
        data: {
          bookingId: this.data.bookingId,
          income: { amount, note: this.data.incomeNote.trim() },
        },
      })
      if (res.result.success) {
        wx.showToast({ title: '收入已记录', icon: 'success' })
        this.setData({ showIncomeInput: false, incomeAmount: '', incomeNote: '' })
        await this._loadDetail()
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络异常', icon: 'none' })
    }
  },

  // 已完成订单手动补录收入
  openIncomeInput() {
    this.setData({
      showIncomeInput: true,
      incomeAmount: this.data.booking.income ? String(this.data.booking.income.amount) : '',
      incomeNote: this.data.booking.income?.note || '',
    })
  },

  // ===== 备注 =====
  openNoteInput() {
    this.setData({ showNoteInput: true })
  },

  onNoteInput(e) {
    this.setData({ noteValue: e.detail.value })
  },

  async saveNote() {
    await this._saveNote(this.data.noteValue)
  },

  async _saveNote(note) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateBookingStatus',
        data: { bookingId: this.data.bookingId, note },
      })
      if (res.result.success) {
        wx.showToast({ title: '备注已保存', icon: 'success' })
        this.setData({ showNoteInput: false })
        await this._loadDetail()
      }
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // ===== 内部：状态变更，返回 true/false =====
  async _updateStatus(status, successMsg) {
    this.setData({ isActing: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateBookingStatus',
        data: { bookingId: this.data.bookingId, status },
      })
      if (res.result.success) {
        if (successMsg) wx.showToast({ title: successMsg, icon: 'success' })
        await this._loadDetail()
        return true
      } else {
        wx.showToast({ title: res.result.error || '操作失败', icon: 'none' })
        return false
      }
    } catch (e) {
      wx.showToast({ title: '网络异常', icon: 'none' })
      return false
    } finally {
      this.setData({ isActing: false })
    }
  },
})
