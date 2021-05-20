const express = require('express');
const router = express.Router();
const { varifyToken } = require('../utils/jwt');
const moment = require('moment');

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
    const { name: username, role, page, pageSize } = req.query;
    let where = {};
    if (username) where['username'] = username;
    if (role) where['role'] = role;
    const count = knex('user').select().where(where).count('id').first();
    const row = knex('user').select().where(where).offset(page <= 1 ? 0 : (page - 1) * pageSize).limit(pageSize);
    Promise.all([count, row]).then(([total, data]) => {
      res.json({ success: true, message: '获取用户列表成功', data: data.map(val => {
        const { id, username, registerDate, registerTime, role } = val;
        return { id, username, registerDate, registerTime, role }
      }), ...total })
    })
  })
  // 添加后台用户
  router.post('/addUser', function(req, res, next) {
    const { name, password, role } = req.body;
    knex('user').select('id').where({ username: name }).then(row => {
      if (row.length) {
        res.json({ success: false, message: '改用户已经存在' })
      } else {
        knex('user').insert({
          username: name,
          password,
          role,
          registerDate: moment().format('YYYY-MM-DD'),
          registerTime: moment().format('HH:mm:ss')
        }).then(data => {
          res.json({ success: true, message: '添加成功' });
        }).catch(() => {
          res.json({ success: false, message: '添加失败' });
        })
      }
    })
  })
  // 删除用户
  router.get('/delUser', function(req, res, next) {
    const { id } = req.query;
    knex('user').where('id', id).del().then(data => {
      res.json({ success: true, message: '删除成功' });
    }).catch(() => {
      res.json({ success: false, message: '删除失败' });
    })
  })
  // 修改用户信息
  router.post('/updateUser', function(req, res, next) {
    const { id, name: username, role, password } = req.body;
    let params = { username, role };
    if (password) {
      params['password'] = password
    }
    knex('user').select('id').where('username', username).then(rows => {
      if (rows.length) {
        res.json({ success: false, message: '已存在该用户名' });
      } else {
        knex('user').where('id', id).update(params).then(data => {
          res.json({ success: true, message: '修改成功' });
        }).catch((err) => {
          console.error(err);
          res.json({ success: false, message: '修改失败' });
        })
      }
    })
  })
  // 获取微信列表
  router.get('/getWeixinUserList', function(req, res, next) {
    const { page, pageSize } = req.query;
    const count = knex('weixin_user').select().where('subscribe', 1).count('id').first();
    const row = knex('weixin_user').select().where('subscribe', 1).offset(page <= 1 ? 0 : (page - 1) * pageSize).limit(pageSize);
    Promise.all([count, row]).then(([total, data]) => {
      res.json({ success: true, message: '获取微信用户列表成功', data: data.map(val => {
        const { openid, ...allData } = val;
        return { ...allData }
      }), ...total });
    }).catch(() => res.json({ success: false, message: '获取微信用户列表失败' }))
  })
  return router;
}

module.exports = {
  user
};
