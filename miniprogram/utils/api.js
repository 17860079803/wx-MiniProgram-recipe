//获取数据库引用

export const db = wx.cloud.database();


//添加数据
export const add = (collectionName, data = {}) => {
  return db.collection(collectionName).add({
    data
  })
}
// 通过id进行查询
export const findById = (collectionName, id = "") => {
  return db.collection(collectionName).doc(id).get({})
}

// 4.根据条件查询  where (全部获取)
export const findAll = async (collectionName, where = {}, orderBy = {
  field: "_id",
  sort: "desc"
}) => {
  // 云开发， 获取数据数据
  // 在程序端，一次性只能获取20条数据，在云端，一次性只能获取100条数据
  const MAX_LIMIT = 20;
  const countResult = await db.collection(collectionName).count();
  const total = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT);
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy(orderBy.field, orderBy.sort).get()
    tasks.push(promise)
  }

  if ((await Promise.all(tasks)).length <= 0) {
    return {
      data: []
    };
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
    }
  })
}
// 3.通过条件进行查询 where （分页 排序）
export const find = (collectionName, where = {}, page = 1, limit = 4, orderBy = {
  field: "_id",
  sort: "desc"
}) => {
  // skip 分页，跳过多少条
  //  1. 4(1,2,3,4)  2.4(5,6,7,8)   3.4（9，10，11，12）
  let skip = (page - 1) * limit;
  return db.collection(collectionName).where(where).skip(skip).limit(limit).orderBy(orderBy.field, orderBy.sort).get();
}
//删除分类数据通过id
export const removeMenuList = (collectionName, id) => {
  return db.collection(collectionName).doc(id).remove()
}
// 7.根据条件删除[根据条件只能查处一条数据，才可以进行删除]
export const removeByWhere = (collectionName, where = {}) => {
  return db.collection(collectionName).where(where).remove()
}
//修改分类 通过id
export const updata = (collectionName, id, data = {}) => {
  return db.collection(collectionName).doc(id).update({
    data
  })
}