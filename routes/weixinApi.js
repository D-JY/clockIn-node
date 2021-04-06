const express = require('express');
const router = express.Router();
const { varifyToken } = require('../utils/jwt');

function weixinApi(knex) {
    router.get('/userList', function(req, res, next) {
        const token = req.get('Authorization');
        const obj = varifyToken(token);
        res.json({ success: true, message: '获取接收人列表成功', ...obj });
    })
    return router;
}

module.exports = {
    weixinApi
}
