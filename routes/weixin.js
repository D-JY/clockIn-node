var crypto = require('crypto');
const { WEIXIN_TOKEN, appID, appsecret } = require('../utils/const');
let http = require('request');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { PRIVATE_KEY } = require('../utils/const');

// 微信配置URL认证
function weixinAuth(knex) {
    return function(req, res, next) {
        console.log(123123)
        const { signature, timestamp, nonce, echostr } = req.query;
        // 1. 将token、timestamp、nonce三个参数进行字典序排序
        let array = new Array(WEIXIN_TOKEN, timestamp, nonce);
        array.sort();
        let str = array.toString().replace(/,/g, '');
        // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
        let sha1Code = crypto.createHash('sha1');
        let code = sha1Code.update(str, 'utf-8').digest('hex');
        // 3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        if (code === signature) {
            res.send(echostr);
        } else {
            res.send('error');
        }
    }
}

// 获取页面授权token
function getPageToken(req, res, next) {
    const { code } = req.query;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appID}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    return new Promise((reslove, reject) => {
        http.get(url, function(err, data, body) {
            body = JSON.parse(body)
            console.log('getPageToken', body)
            if (body.access_token) {
                reslove(body)
            } else {
                reject(body)
            }
        })
    })
}


// 获取微信用户信息
function getWeixinUserInfo(knex) {
    return function(req, res, next) {
        getPageToken(req, res, next).then(body => {
            console.log('getWeixinUserInfo11', body)
            const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${body.access_token}&openid=${body.openid}&lang=zh_CN`;
            http.get(url, function(err, data, result) {
                result = JSON.parse(result)
                console.log('getWeixinUserInfo', result)
                if (result.errcode) {
                    res.json({ success: false, ...result })
                } else {
                    console.log(result, 333)
                    const { openid, unionid, ...userInfo } = result
                    knex('weixin_user').select().where({ openid: result.openid }).then(row => {
                        if (row.length <= 0) {
                            knex('weixin_user').insert({
                                openid,
                                userInfo: JSON.stringify(userInfo),
                                createDate: moment().format('YYYY-MM-DD'),
                                createTime: moment().format('HH:mm:ss'),
                                unionid
                            }).then(rows => {
                                console.log(rows)
                            })
                        }
                    })
                    const token = jwt.sign({ openid }, PRIVATE_KEY);
                    res.json({ success: true, message: '获取微信用户信息成功', token, userInfo })
                }
            })
        }).catch(err => {
            console.log('getWeixinUserInfo222', err)
        })
    }
}

module.exports = {
    weixinAuth,
    getPageToken,
    getWeixinUserInfo
};
