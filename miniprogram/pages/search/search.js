import {
  find,
  findAll
} from "../../utils/api";
import {
  tables
} from "../../utils/config";
Page({
  data: {
    hotSearch: [], //存放热门搜索
    JinSearch: [], //近期搜索
  },
  onShow: function () {
    this.getHotSearchList()
    this.getJinSearch()
  },
  //获取热门搜索的内容
  async getHotSearchList() {
    let result = await find(tables.recipeList, {
      status: 1
    }, 1, 6, {
      field: "view",
      sort: "desc"
    })
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
      hotSearch: result.data
    })
  },
  //点击了热门分类跳转详情页面
  goRecipeDetail(e) {
    let {
      id,
      title,
      nickName
    } = e.currentTarget.dataset
    //点击之后吧搜索的标题存入到本地缓存中,
    // 当有新的值过来之后取出本地缓存查找,如果没有则添加进去,如果有吧,原来的放到第一位置
    let JinSearch = wx.getStorageSync('JinSearch') || [];
    let findIndex = JinSearch.findIndex(item => {
      return item == title
    })
    if (findIndex == -1) {
      //本地缓存中不存在,需要添加
      JinSearch.unshift(title)
    } else {
      //存在 (旧的截取掉,新的插入到最前面)
      JinSearch.splice(findIndex, 1);
      JinSearch.unshift(title);
    }
    wx.setStorageSync('JinSearch', JinSearch)
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}&nickName=${nickName}`,
    })
  },
  //近期搜索(获取近期搜索的内容)
  getJinSearch() {
    let JinSearch = wx.getStorageSync("JinSearch") || [];
    this.setData({
      JinSearch
    })
  },
  //输入框 , 获取到输入的关键词
  searchVal(e) {
    this.data.searchVal = e.detail.value
  },
  //点击了搜索按钮跳转列表页
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
    let JinSearch = wx.getStorageSync('JinSearch') || [];
    let findIndex = JinSearch.findIndex(item => {
      return item == title
    })
    if (findIndex == -1) {
      //本地缓存中不存在,需要添加
      JinSearch.unshift(title)
    } else {
      //存在 (旧的截取掉,新的插入到最前面)
      JinSearch.splice(findIndex, 1);
      JinSearch.unshift(title);
    }
    wx.setStorageSync('JinSearch', JinSearch)
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })
  },
})