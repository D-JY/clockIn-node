const jwt = require('jsonwebtoken');
const { PRIVATE_KEY, JWT_EXPIRED, WHITE_LIST } = require('./const');

// 创建token的方法
function createToken (data) {
    let obj = {};
    obj.data = data || {}; // 存入token的数据
    obj.ctime = (new Date()).getTime(); // token的创建时间
    obj.expiresIn = JWT_EXPIRED; //设定的过期时间
    let token = jwt.sign(obj, PRIVATE_KEY)
    return token;
}

// 校验token
function checkLogin(req, res, next) {
    if (WHITE_LIST.includes(req.url)) {
        next();
        return;
    }
    const token = req.get('Authorization');
    const obj = varifyToken(token);
    if (obj) {
        next();
    } else {
        res.send(401, { message: 'token无效请重新登录' });
    }
}

// 解析token
function varifyToken(token) {
    try {
        let { data, ctime, expiresIn } = jwt.verify(token, PRIVATE_KEY);
        let nowTime = (new Date()).getTime();
        if (nowTime - ctime < expiresIn) {
            return data;
        } else {
            return void 0;
        }
    } catch(error) {
        return void 0;
    }
}

module.exports = {
    createToken,
    varifyToken,
    checkLogin
};
