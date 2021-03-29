const moment = require('moment');
const { createToken } = require('../utils/jwt');
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/const');

// 注册
function register(knex) {
    return function(req, res, next) {
        const { name, password } = req.body;
        knex('user').insert({
            username: name,
            password,
            registerDate: moment().format('YYYY-MM-DD'),
            registerTime: moment().format('HH:mm:ss'),
            lastDate: moment().format('YYYY-MM-DD'),
            lastTime: moment().format('HH:mm:ss')
        }).then(data => {
            console.log(data.Result, 11)
        })
        res.json({token: 'abcd123123', body: req.body, query: req.query});
    }
}

// 登录
function login(knex) {
    return function(req, res, next) {
        const { name, password } = req.body;
        knex('user').select().where({ username: name }).then(data => {
            if (data) {
                if (data[0].password === password) {
                    // 登录成功，签发一个token并返回给前端
                    const token = createToken({ name })
                    const { password, ...info } = data[0]
                    res.json({ message: '登录成功', success: true, token, data: info })
                } else {
                    res.json({ message: '密码错误', success: false })
                }
            } else {
                res.json({ message: '该账号未注册', success: false })
            }
        })
    }
}

module.exports = {
    login
};
