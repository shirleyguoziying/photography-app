App({
  globalData: {
    user: null,
    role: 'user'
  },

  onLaunch() {
    console.log('App launched')
    
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-7gpg93cufb3a4583',
        traceUser: true
      })
    }
    
    this.globalData.role = 'user'
    this.globalData.user = { nickName: '用户', role: 'user' }
  }
})
