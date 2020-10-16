import {
  tables
} from "../../utils/config"
import {
  findAll,
  add
} from "../../utils/api"
Page({
  //页面的初始数据
  data: {
    recipeTypeLists: [], //菜谱分类列表
    files: [], //图片文件
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // 获取菜谱分类列表
    this._getRecipeTypeLists()
    wx.showModal({
      cancelColor: 'cancelColor',
      title: "发布提示",
      content: "开发者提示您:必须发布菜谱相干内容,严禁散播黄赌毒等违法社会言论,一经查证,立即追究",
      showCancel: false,
      confirmText:"我知道了"
    })
  },

  //1.获取类别列表
  async _getRecipeTypeLists() {
    let result = await findAll(tables.recipeType);
    this.setData({
      recipeTypeLists: result.data
    })
  },
  //点击了图片选择
  _selectImage(e) {
    //获取到图片临时存放的位置
    let tempFilePaths = e.detail.tempFilePaths;
    let files = tempFilePaths.map((item) => {
      return {
        url: item
      }
    })
    //如果用户选择两次的话,第一次选择和第二次选择进行拼接
    files = this.data.files.concat(files)
    this.setData({
      files
    })
  },
  //点击了图片的删除
  _deleteImage(e) {
    let index = e.detail.index; //要删除图片的索引
    let files = this.data.files //要删除的图片的临时路径
    files.splice(index, 1)
    this.setData({
      files
    })
  },
  //点击了发布按钮
  async clickRelease(e) {
    //获取到用户输入的信息
    let {
      recipeMakes,
      recipeName,
      recipeTypeid
    } = e.detail.value;
    //验证判断
    if (recipeMakes == "" || recipeName == "" || recipeTypeid == "" || this.data.files.length <= 0) {
      wx.showToast({
        title: '请补全信息',
        icon: "none",
        duration: 2000
      })
      return;
    }
    //文件上传
    let fields = await this._uploaderFiles(this.data.files);
    fields = fields.map(item => {
      return item.fileID;
    })
    //参数补全
    let follows = 0,
      view = 0,
      status = 1,
      time = new Date().getTime();
    let data = {
      recipeMakes,
      recipeName,
      recipeTypeid,
      follows,
      fields,
      view,
      status,
      time,
    }
    //执行插入数据库
    let result = await add(tables.recipeList, data);
    if (result._id) {
      wx.showToast({
        title: '发布成功！',
      }) 
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1500)
    } else {
      wx.showToast({
        title: '请检测网络',
        icon: "none"
      })
    }
  },
  //文件上传方法封装
  async _uploaderFiles(files) {
    let allFilesPromise = [] //所有上传的文件返回值
    files.forEach((item, index) => {
      let extName = files[index].url.split('.').pop(); //获取拓展名
      let cloudPath = new Date().getTime() + '_' + index + '.' + extName; //名字
      let fileID = wx.cloud.uploadFile({
        cloudPath: "re-recipes/" + cloudPath, // 上传至云端的路径
        filePath: item.url, // 小程序临时文件路径
      })

      allFilesPromise.push(fileID);
    });
    return await Promise.all(allFilesPromise)

  }
})