const {
  findAll
} = require("../../utils/api")
const {
  tables
} = require("../../utils/config")

// pages/typelist/typelist.js
Page({
  data: {
    types: [], //菜谱分类列表
    searchVal:null,  //输入框内容
  },
  onLoad: function (options) {
    this.getType()
  },
  //获取分类列表业务

  async getType() {
    let result = await findAll(tables.recipeType)
    this.setData({
      types: result.data
    })
  },
  goRecipeList(e) {
    console.log(e);
    let {
      id = null, title = this.data.searchVal, tag
    } = e.currentTarget.dataset
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
  //获取到搜索的关键词
  searchVal(e) {
    this.data.searchVal = e.detail.value
  }
})