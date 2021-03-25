const { varifyToken } = require('../utils/jwt');

// 获取用户信息
function user(knex) {
  return function(req, res, next) {
    const token = req.get('Authorization');
    const obj = varifyToken(token);
    knex('user').select().where({ username: obj.name }).then(data => {
      if (data) {
        const { password, ...resutl } = data[0];
        res.json({ success: true, data: resutl, message: '获取用户信息成功' });
      } else {
        res.json({ success: false, message: '获取不到用户信息' });
      }
    })
  }
}

module.exports = {
  user
};
