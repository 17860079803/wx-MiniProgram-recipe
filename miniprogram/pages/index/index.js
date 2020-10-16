import {
  find,
  findAll
} from "../../utils/api"
import {
  tables
} from "../../utils/config"
Page({
  data: {
    hotRecipes: [], //热门菜谱
    recipeType: [], //菜谱分类列表
    searchVal:null, //输入框的值
  },
  onShow() {
    //页面加载调用获取菜单列表/分类列表
    this.getHotRecips()
    this.getRecipesType()
  },
  //获取首页热门菜谱
  async getHotRecips() {
    // 准备条件
    let where = {
      status: 1,
    }
    let orderBy = {
      field: "view",
      sort: "desc"
    }
    //查询数据
    let result = await find(tables.recipeList, where, 1, 4, orderBy)
    let usersAllPromise = []; //存放所有的用户信息
    result.data.map((item, index) => {
      // item._openid
      let userspromise = findAll(tables.userTable, {
        _openid: item._openid
      });
      usersAllPromise.push(userspromise)
    })
    let users = await Promise.all(usersAllPromise)
    result.data.map((item, index) => {
      item.userInfo = users[index].data[0].userInfo
    })
    this.setData({
      hotRecipes: result.data
    })
  },
  //获取首页分类
  async getRecipesType() {
    let result = await find(tables.recipeType, {}, 1, 2)
    this.setData({
      recipeType:result.data
    })
  },
  //点击菜谱分类跳转页面
  goRecipeType() {
    wx.navigateTo({
      url: '../typelist/typelist',
    })
  },
  //点击普通分类跳转页面
  goRecipeList(e) {
    let { id = null, title = this.data.searchVal, tag } = e.currentTarget.dataset
     if (tag == "search" && this.data.searchVal == null) {
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
  //点击热门分类下图片跳转详情页面
  goRecipeDetail(e) {
    let { id, title, nickName } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}&nickName=${nickName}`,
    })
  },
  //获取到搜索的关键词
  searchVal(e) {
    this.data.searchVal = e.detail.value
  }
})