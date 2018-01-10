//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    sheetlist:[]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  redirect:function(){
    console.log('点击');
    wx.navigateTo({
      url: '../index/index',
      success: function(res){
      console.log(res)
      },
      fail: function(res) {
        // fail
      console.log(res)
        
      },
      complete: function(res) {
        // complete
      console.log(res)
        
      }
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo,
      })
    }),
    wx.setNavigationBarTitle({
      title: '我的收藏'
    })
  },

  onShow: function(){
    var songsheet = app.globalData.songsheet
    this.setData({
      sheetlist:songsheet
    })
  },

  playMusic: function (event) {
    wx.request({
      url: 'http://localhost:3000/music/url',
      data: {
        id: event.currentTarget.dataset.id
      },
      method: 'GET',
      success: function (res) {
        let songData = {
          id: event.currentTarget.dataset.id,
          name: event.currentTarget.dataset.name,
          mp3Url: res.data.data[0].url,
          picUrl: event.currentTarget.dataset.picurl,
          singer: event.currentTarget.dataset.singer,
          islike: true
        }
        // 将当前点击的歌曲保存在缓存中
        app.globalData.clickedSong_global = songData
        wx.setStorageSync('clickdata', songData)
      },
      fail: function (res) {
      },
      complete: function (res) {
        wx.switchTab({
          url: '../now/index',
        })
      }
    })
  }
})
