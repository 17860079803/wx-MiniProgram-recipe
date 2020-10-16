const {
  find,
  findAll,
  db
} = require("../../utils/api");
const {
  tables
} = require("../../utils/config");
// pages/recipelist/recipelist.js
Page({
  data: {
    recipesLists: [], //菜谱列表
    page: 1, //默认页码
    limit: 5, //每次查询的条数
    tips: false, //该分类没有数据
    tip: false, //该分类没有更多数据了
  },
  onLoad: function (options) {
    //接收路径传参
    this.data.tag = options.tag
    //设置标题
    wx.setNavigationBarTitle({
      title: options.title,
    })
    //存储id
    this.data.typeid = options.id;
    //存储title
    this.data.title = options.title;
    //页面加载调获取列表业务
    this.getRecipeList();
  },
  //获取菜谱列表业务(满足不同点击进来的需求,需要对传入tag值进行判断,不同的tag值走不同的分支逻辑)
  async getRecipeList() {
    //条件准备
    let tag = this.data.tag;
    let page = this.data.page;
    let limit = this.data.limit;
    let where = {},
      orderBy = {};
    switch (tag) {
      case "common": //普通
        where = {
          status: 1,
          recipeTypeid: this.data.typeid
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
      case "recommend": //推荐
        where = {
          status: 1,
        }
        orderBy = {
          field: "follows",
          sort: "desc"
        }
        break;
      case "hotRecipe": //热门
        where = {
          status: 1,
        }
        orderBy = {
          field: "view",
          sort: "desc"
        }
        break;
      case "search": //搜索
        let title = this.data.title;
        where = {
          status: 1,
          recipeName:db.RegExp({
            regexp: title,
            options: 'i',
          }),
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
      default:
        break;
    }
    //查询数据(根据分类ID查询该分类下面所有的菜谱)
    let result = await find(tables.recipeList, where, page, limit, orderBy);
    //如果查询到的是一个空数组,直接显示没有数据
    if (result.data.length <= 0 && page == 1) {
      this.setData({
        tips: true
      })
      return
    }
    if (result.data.length < limit) {
      this.setData({
        tip: true
      })
    }
    //处理发布人信息
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

    //进行数组的拼接,把滚动获取到的更多数据拼接进去原来的数组
    let recipesLists = this.data.recipesLists.concat(result.data)
    this.setData({
      recipesLists
    })
  },
  //下滑加载更多数据
  onReachBottom() {
    this.data.page++
    this.getRecipeList()
  },
  //跳转详情页面
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

})