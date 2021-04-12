const express = require('express');
const router = express.Router();
const { varifyToken } = require('../utils/jwt');

function user(knex) {
  // 获取用户信息
  router.get('/user', function(req, res, next) {
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
  })
  // 获取后台用户列表
  router.get('/userList', function(req, res, next) {
    const { name: username, role } = req.query;
    let where = {};
    if (username) where['username'] = username;
    if (role) where['role'] = role;
    knex('user').select().where(where).then(data => {
      res.json({ success: true, message: '获取用户列表成功', data: data.map(val => {
        const { id, username, registerDate, registerTime, role } = val;
        return { id, username, registerDate, registerTime, role }
      }) })
    })
  })
  return router;
}

module.exports = {
  user
};
