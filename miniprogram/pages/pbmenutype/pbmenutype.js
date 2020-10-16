// pages/pbmenutype/pbmenutype.js
import {
  add,
  findAll,
  removeMenuList,
  updata
} from "../../utils/api"
import {
  tables
} from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addVal: "", //添加菜谱分类名
    recipeTypeLists: [], //所有分类列表
    updataVal: "", //要修改的分类名
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


  },
  onShow: function () {
    this.getAllTypeList()
  },
  //获取用户添加的分类信息
  _addVal(e) {
    this.setData({
      addVal: e.detail.value
    })
  },
  //分类的添加
  async clickAdd() {
    //获取分类名称
    let typeName = this.data.addVal;
    //添加之前先去判断分类是否已经存在
    let allTypes = this.data.recipeTypeLists
    let findIndex = allTypes.findIndex((item) => {
      return item.typeName == typeName
    })
    // 返回-1
    if (findIndex != -1) {
      wx.showToast({
        title: '当前类别已经存在',
        icon: "none"
      })
      return;
    }
    //当前列表没有用户输入的则继续添加
    let result = await add(tables.recipeType, {
      typeName
    })
    if (result._id) {
      wx.showToast({
        title: '添加成功',
      })
      this.setData({
        addVal: ""
      })
      //添加成功刷新列表
      this.getAllTypeList()
    }
  },
  //获取所有的分类
  async getAllTypeList() {
    let result = await findAll(tables.recipeType);
    //设置给页面recipeTypeLists方便遍历
    this.setData({
      recipeTypeLists: result.data
    })
  },
  //点击了删除
  async clickDel(e) {
    let id = e.currentTarget.dataset.id; //删除的条件
    let index = e.currentTarget.dataset.index; //当前删除分类在数组的位置（索引）
    let result = await removeMenuList(tables.recipeType, id)
    if (result.stats.removed == 1) {
      wx.showToast({
        title: '删除成功',
      })
      // 更新页面
      let recipeTypeLists = this.data.recipeTypeLists
      recipeTypeLists.splice(index, 1);
      this.setData({
        recipeTypeLists
      })
    }
  },
  //点击了修改
  clickUpdata(e) {
    let index = e.currentTarget.dataset.index; //当前删除分类在数组的位置（索引）
    let recipeTypeLists = this.data.recipeTypeLists; //所有分类
    let type = recipeTypeLists.find((item, ind) => {
      return ind == index
    })
    this.setData({
      updataVal: type.typeName,
      updataid: type._id,
      updataindex: index, // 索引
    })
  },
  //输入后分类名字发生改变
  updataVal(e) {
    this.setData({
      updataVal: e.detail.value
    })
  },
  //输入完成后点击了修改
  async _clickUpdata() {
    let index = this.data.updindex;
    // id  
    let id = this.data.updataid; //条件
    let typeName = this.data.updataVal; //修改的值
    let allTypes = this.data.recipeTypeLists; //所有的分类


    // 先去判断当前分类是否已经存在
    let fndIndex = allTypes.findIndex((item) => {
      return item.typeName == typeName;
    })

    // 返回-1
    if (fndIndex != -1) {
      wx.showToast({
        title: '当前类别已经存在',
        icon: "none"
      })
      return;
    }
    // //不存在执行修改
    let result = await updata(tables.recipeType, id, {
      typeName
    })
    if (result.stats.updated == 1) {
      wx.showToast({
        title: '修改成功',
      })
      this.getAllTypeList()
      this.setData({
        recipeTypeLists: allTypes,
        updataVal: ""
      })
    }
  },
})