import {
  add,
  findAll,
  updata,
  findById
} from "../../utils/api"
import {
  tables,
  isAdminOpenid
} from "../../utils/config"

// pages/personal/personal.js
Page({
  // 页面的初始数据
  data: {
    isLogin: false, //用户是否登录
    userInfo: {}, //当前用户的信息
    isAdmin: false, //是不是管理员
    activeIndex: "0", //选项卡的默认值
    selfMenuList: [], //菜谱列表
    selfResult: [], //自己发布的菜谱分类列表
    selfFollowRecipes: [] //关注列表
  },
  //检测用户
  onShow() {
    this.checkSession()
  },
  // 检测用户登录函数
  checkSession() {
    wx.checkSession({
      //已经登录
      success: (res) => {
        //已经登陆
        // 获取用户信息
        let userInfo = wx.getStorageSync('userInfo');
        let openid = wx.getStorageSync('openid');
        let isAdmin = openid == isAdminOpenid ? true : false;
        this.setData({
          isLogin: true,
          userInfo,
          isAdmin
        })
        //登录成功调用获取列表数据的方法
        this._switchActiveIndex()
      },
      //未登录状态
      fail: (err) => {
        this.setData({
          isLogin: false
        });
        //提示登录
        wx.showToast({
          title: '请先去登录',
          icon: "none"
        })
      }
    })
  },
  // 点击了登录按钮
  login(e) {
    //保存this
    let _this = this
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录才能有更好的体验',
        icon: "none"
      })
      return;
    }
    //登录业务
    wx.login({
      success() {
        //登录成功获取openId
        wx.cloud.callFunction({
          name: "login",
          async success(cloudres) {
            //获取登录用户的openid
            let openid = cloudres.result.openid;
            // 获取用户信息
            let userInfo = e.detail.userInfo;
            //在添加之前，要先进行查询，
            let usersResult = await findAll(tables.userTable, {
              openid
            });
            //如果用户没有登陆过就把用户信息存储进去
            if (usersResult.data.length <= 0) {
              let result = await add(tables.userTable, {
                userInfo
              })
            }
            wx.showToast({
              title: '登陆成功',
            })
            //登录成功调用获取列表数据的方法
            _this._switchActiveIndex()
            // 判断是否为管理员登陆
            let isAdmin = openid == isAdminOpenid ? true : false;
            // 多个管理员
            // console.log(isAdminOpenid);
            // console.log(openid);
            
            // let isAdmin = isAdminOpenid.some(item => {
            //   console.log(item);
              
            //   item == openid ?true:false
            // })
            // console.log(isAdmin);
            
            _this.setData({
              isLogin: true, //登陆了，就把状态改为ture
              userInfo,
              isAdmin
            })
            // 将openid 和userinfo存入缓存
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('openid', openid);
          }
        })
      },
      fail() {
        wx.showToast({
          title: '由于网络故障，请重新登陆！！！',
          icon: "none"
        })
      }
    })
  },
  // 管理员点击头像，进入菜谱分类页面
  recipePage() {
    if (!this.data.isAdmin) return;

    wx.navigateTo({
      url: '/pages/pbmenutype/pbmenutype',
    })
  },
  //点击了加号跳转至菜谱添加页面
  pbmenu() {
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },
  //选项卡的切换
  _changeActiveIndex(e) {
    let activeIndex = e.currentTarget.dataset.index;
    this.setData({
      activeIndex
    }, () => {
      this._switchActiveIndex();
    })
  },
  //设置一个switch循环用来管理选项卡,index不同请求不同的列表数据
  _switchActiveIndex() {
    let activeIndex = this.data.activeIndex;
    switch (activeIndex) {
      case "0":
        //菜谱信息
        this.getMenuList()
        break;
      case "1":
        //分类信息
        this.getRecipeList()
        break;
      case "2":
        //关注信息
        this._getSelfFollows()
        break;
      default:
        wx.showToast({
          title: '暂无信息',
          icon: "none"
        })
        break;
    }
  },
  //index==0 获取所有菜谱列表
  async getMenuList() {
    let _openid = wx.getStorageSync('openid') //获取openid
    let where = {
      status: 1,
      _openid
    };
    let orderBy = {
      field: "time",
      sort: "desc"
    }
    let result = await findAll(tables.recipeList, where, orderBy)
    this.setData({
      selfMenuList: result.data
    })
  },
  //点击了菜谱删除
  clickDel(e) {
    let _this = this;
    wx.showModal({
      title: '删除提示',
      content: "您确定要删除吗?",
      async success(res) {
        if (res.confirm) {
          let {
            id,
            index
          } = e.currentTarget.dataset
          let result = await updata(tables.recipeList, id, {
            status: 2
          })
          let selfMenuList = _this.data.selfMenuList
          selfMenuList.splice(index, 1);
          _this.setData({
            selfMenuList
          })
        }
      }
    })
  },
  //点击了图片跳转详情页面
  goRecipeDetail(e) {
    let {
      id,
      title,
      nickName
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}&nickName=${nickName}`,
    })
  },
  //获取分类列表
  async getRecipeList() {
    let _openid = wx.getStorageSync('openid')
    let where = {
      _openid,
      status: 1
    }
    //获取自己发布的菜谱
    let selfResult = await findAll(tables.recipeList, where)
    // 获取自己菜谱分类的id
    let typeids = selfResult.data.map((item) => {
      return item.recipeTypeid
    })
    //数组去重
    let newTypesId = Array.from(new Set(typeids))
    let typeAllPromise = [];
    newTypesId.forEach(_id => {
      let typePromise = findById(tables.recipeType, _id)
      typeAllPromise.push(typePromise)
    })
    let _selfResult = await Promise.all(typeAllPromise)
    this.setData({
      selfResult: _selfResult
    })
  },
  //获取关注列表
  async _getSelfFollows() {
    // 1.去关注表获取自己关注的信息
    let _openid = wx.getStorageSync('openid');
    let result = await findAll(tables.followTable, {
      _openid
    })
    // 2.根据菜谱id。获取菜谱信息
    let allPromise = [];
    result.data.forEach((item) => {
      let promsie = findById(tables.recipeList, item.recipeId);
      allPromise.push(promsie)
    })
    let selfFollowRecipes = await Promise.all(allPromise);
    let usersAllPromise = []; //存放所有的用户信息
    selfFollowRecipes.map((item, index) => {
      let userspromise = findAll(tables.userTable, {
        _openid: item.data._openid
      });
      usersAllPromise.push(userspromise)
    })
    let users = await Promise.all(usersAllPromise)
    selfFollowRecipes.map((item, index) => {
      item.data.userInfo = users[index].data[0].userInfo
    })
    // console.log(recipes)
    this.setData({
      selfFollowRecipes
    })

  },
  //分类跳转列表页
    goRecipeList(e) {
      let {
        id = null, title = this.data.searchVal, tag
      } = e.currentTarget.dataset
      if (tag == "search" && title == null) {
        wx.showToast({
          title: '请填写搜索条件',
          icon: "none"
        })
        return;
      }
      wx.navigateTo({
        url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
      })
    },
})