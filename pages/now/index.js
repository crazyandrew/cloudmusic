//index.js
//获取应用实例
var Common = require('../../common')
var src_temp = ''
var app = getApp()
Page({
  data: {
    id: "",
    name: "",
    src: "",
    poster: "",
    author: "",
    isplaying: true,
    islike: false,
    islyric: false,
    sumduration: 0,
    lyricobj: {},
    lyricArr: [],
    isadd: false,
    items: [
      { name: 'recent', value: '最近' },
      { name: 'like', value: '我的收藏' }
    ],
    percent: '100%'
  },

  // 将歌曲添加收藏
  addToSheet: function () {
    this.setData({
      islike: true,
    });
    var targetSong = wx.getStorageSync('clickdata');
    var arr = app.globalData.songsheet;
    //遍历全局数组app.globalData.songsheet,查看是否重复
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == targetSong.id) {
        return;
      }
    }
    if (i == len) {
      app.globalData.songsheet.push(targetSong);
    }
    console.log('app.globalData.songsheet:', app.globalData.songsheet);
  },

  //将歌曲取消收藏
  removeFromSheet: function () {
    this.setData({
      islike: false,
    });
    var targetSong = wx.getStorageSync('clickdata');
    var arr = app.globalData.songsheet;
    //遍历全局数组app.globalData.songsheet,
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == targetSong.id) {
        app.globalData.songsheet.splice(i, 1);
        console.log('app.globalData.songsheet:', app.globalData.songsheet);
        return;
      }
    }
  },

  addsong: function () {
    this.setData({
      percent: '0'
    })
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      percent: '100%'
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  showCircle: function () {
    this.setData({
      islyric: true,
      percent: '100%'
    })
  },
  showlyric: function () {
    this.setData({
      islyric: false,
      percent: '100%'
    })
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log('正在播放 onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    }),
      wx.setNavigationBarTitle({
        title: '正在播放'
      })
  },


  onShow: function () {
    let that = this;
    // 判断该歌曲是否被收藏，控制收藏图标的显示
    var clickedSong_global = app.globalData.clickedSong_global;
    console.log('clickedSong_global:', clickedSong_global)
    var arr = app.globalData.songsheet;
    //遍历全局数组app.globalData.songsheet,
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == clickedSong_global.id) {
        this.setData({
          islike: true
        })
        break;
      }
    }
    if(i == len){
      this.setData({
        islike: false
      })
    }


    Common.asyncGetStorage('clickdata')//本地缓存
      .then(
      data => {
        if (!data) return;
        that.setData({
          id: data.id,
          name: data.name,
          src: data.mp3Url,
          poster: data.picUrl,
          author: data.singer,
        })
        return Common.playMusic(data.mp3Url, data.name, data.picUrl);//播放音乐
      })
      .then(status => {
        if (!status) return;
        wx.hideLoading();
        console.log('id,', that.data.id)
        return Common.getlyric(that.data.id)
      })
      .then((lyricArr) => {
        console.log('lyricArr', lyricArr)
        that.setData({
          lyricArr: lyricArr
        })
        return Common.getMusicData()
      })
      .then(data => {
        let tempduration = data.duration
        console.log('get bg success', tempduration, data)
        // 设置时长
        that.setData({
          sumduration: tempduration
        })
      })
  },
  //播放歌曲
  audioPlay: function () {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var status = res.status
        var dataUrl = res.dataUrl
        var currentPosition = res.currentPosition
        var duration = res.duration
        var downloadPercent = res.downloadPercent
        wx.playBackgroundAudio({
          dataUrl: dataUrl
        })
        wx.seekBackgroundAudio({
          position: currentPosition
        })

      }
    })
    this.setData({
      isplaying: true
    })
  },
  //暂停歌曲
  audioPause: function () {
    wx.pauseBackgroundAudio()
    this.setData({
      isplaying: false
    })
  },
  audio14: function () {

  },
  audioStart: function () {

  },
  slider3change: function (e) {
    sliderToseek(e, function (dataUrl, cal) {
      wx.playBackgroundAudio({
        dataUrl: dataUrl
      })
      wx.seekBackgroundAudio({
        position: cal
      })
    })

  },
  prev: function () {
    prevSong(this)
  },
})
// 上一曲
function prevSong(that) {
  let id = that.data.id
  console.log('id', id)
  wx.getStorage({
    key: 'searchReault',
    success: function (res) {
      console.log(res.data)
      let currentSongIndex = res.data.findIndex((item) => {
        return item.id == id;
      })
      console.log(currentSongIndex)
      currentSongIndex--;
      console.log(res.data[currentSongIndex])
      wx.playBackgroundAudio({
        dataUrl: res.data[currentSongIndex].mp3Url
      })
      wx.switchTab({
        url: '../now/index'
      })
    }
  })
}
//滑动 歌曲快进
function sliderToseek(e, cb) {
  wx.getBackgroundAudioPlayerState({
    success: function (res) {
      var dataUrl = res.dataUrl
      var duration = res.duration
      let val = e.detail.value
      let cal = val * duration / 100
      cb && cb(dataUrl, cal);
    }
  })
}

// 获取歌词
function getlyric(id, cb) {
  console.log('id:', id)
  let url = `http://neteasemusic.leanapp.cn/lyric`
  wx.request({
    url: url,
    data: {
      id: id
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    success: function (res) {
      // success
      if (!res.data.lrc.lyric) return false;
      let lyric = res.data.lrc.lyric
      let timearr = lyric.split('[')
      let obj = {}
      let lyricArr = []
      // seek 为键  歌词为value
      timearr.forEach((item) => {
        let key = parseInt(item.split(']')[0].split(':')[0]) * 60 + parseInt(item.split(']')[0].split(':')[1])
        let val = item.split(']')[1]

        obj[key] = val
      })
      for (let key in obj) {
        // obj[key] = obj[key].split('\n')[0]
        lyricArr.push(obj[key])
      }
      cb && cb(obj, lyricArr)
    },
    fail: function (res) {
      // fail
    },
    complete: function (res) {
      // complete
    }
  })
}
// ----------------------------------------------------
