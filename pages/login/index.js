Page({
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var token = wx.getStorageSync('token')
    var name = wx.getStorageSync('name')
    var pwd = wx.getStorageSync('pwd')
    /*
    if (token == '') {
      wx.navigateTo({
        url: '/pages/index/index'
      })
    }*/

    if (name != '') {
      if (pwd != '') {
        wx.redirectTo({
          url: '../account/index?userInfo.nickName=' + name + ''
        })
      }
    }
  },
  //用户名和密码输入框事件
  usernameInput: function (e) {
    // console.log(e)
    this.setData({
      userN: e.detail.value
    })
  },
  passwordInput: function (e) {
    this.setData({
      passW: e.detail.value
    })
  },
  //登录按钮点击事件，调用参数要用：this.data.参数；
  //设置参数值，要使用this.setData({}）方法
  loginBtnClick: function (a) {
    // console.log(a)
    var that = this
    if (this.data.userN.length == 0 || this.data.passW.length == 0) {
      this.setData({
        infoMess: '温馨提示：用户名或密码不能为空！',
      })
    } else {
      wx.request({
        url: 'http://www.tpshop.com/index.php?m=Api&c=User&a=login',
        data: {
          username: this.data.userN,
          password: this.data.passW,
          unique_id: '123456'
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          // console.log(res.data.result)
          if (res.data.status == -1) {
            userName: '缺少参数'
          } else {
            //存用户session
            // wx.setStorageSync('token', res.data.result.token)
            // wx.setStorageSync('user_id', res.data.result.user_id)
            // wx.setStorageSync('name', that.data.userN)
            // wx.setStorageSync('pwd', that.data.passW)


            wx.setStorage({
              key: 'name',
              data: res.data.result.mobile,
            })
            wx.setStorage({
              key: 'token',
              data: res.data.result.token,
            })
            wx.setStorage({
              key: 'pwd',
              data: that.data.passW,
            })
            //  wx.switchTab({
            wx.redirectTo({
              url: '../my/my?name=' + res.data.result.mobile + '&pwd=' + that.data.passW + ''
            })
          }
        }
      })
    }
  }
})