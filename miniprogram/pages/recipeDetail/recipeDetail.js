import {
  findById,
  updata,
  db, 
  findAll,
  add,
  removeByWhere
} from "../../utils/api";
import {
  tables
} from "../../utils/config";
const _ = db.command; //定义数据库方法对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    recipesDetail: {}, //详情数据
    isFollows: false, //是否关注
  },
  //监听页面加载
  onLoad: function (options) {
    let {
      id,
      title,
      nickName
    } = options
    wx.setNavigationBarTitle({
      title,
    })
    //临时存储ID
    this.data.id = id;
    this.data.nickName = nickName
    //页面加载调用获取详情业务逻辑
    this.getDetailList();
  },
  //获取详情信息业务逻辑
  async getDetailList() {
    let id = this.data.id;
    let result = await findById(tables.recipeList, id);
    // 把用户id加进去
    result.data.nickName = this.data.nickName
    //处理浏览量问题 当用户进入详情页面,所在菜谱的浏览量+1
    let updataView = updata(tables.recipeList, id, {
      view: _.inc(1)
    })
    //修改页面
    result.data.view++;

    //用户关注
    // 1登录状态判断,如果用户没登录一直显示关注字样
    let _openid = wx.getStorageSync("openid") || null;
    if (_openid == null) {
      this.setData({
        isFollows: false
      })
    } else {
      //查表用户是否已经关注了当前菜谱,关注了就把状态改为true
      let where = {
        _openid:_openid,
        recipeId: id
      }
      //执行查询状态
      let queryFollows = await findAll(tables.followTable, where);
      console.log(queryFollows);
      
      if (queryFollows.data.length <= 0) {
        this.setData({
          isFollows: false
        })
      } else {
        this.setData({
          isFollows: true
        })
      }
    }
    this.setData({
      recipesDetail: result.data
    })
  },
  //点击了关注与取消
  async clickFollows() {
    let _openid = wx.getStorageSync('openid') || null;
    let id = this.data.id
    if (_openid == null) {
      wx.showToast({
        title: '请先去登录哟!',
        icon: "none"
      })
      return;
    }
    //取消关注
    if (this.data.isFollows) {
      let Follows = await removeByWhere(tables.followTable, {
        _openid,
        recipeId: id
      })
      if (Follows.stats.removed == 1) {
        //更新菜谱列表中的follows字段
        updata(tables.recipeList, id, {
          follows: _.inc(-1)
        })
        this.data.recipesDetail.follows--;
        this.setData({
          isFollows: false,
          recipesDetail: this.data.recipesDetail
        })
      }
    } else {
      //进行关注
      //插入关注表
      let Follows = await add(tables.followTable, {
        recipeId: id
      })
      if (Follows._id) {
        //关注成功,修改
        updata(tables.followTable, id, {
          follows: _.inc(1)
        })
        wx.showToast({
          title: '关注成功',
        })
        this.data.recipesDetail.follows++;
        this.setData({
          isFollows: true,
          recipesDetail: this.data.recipesDetail
        })
      }
    }
  }
})