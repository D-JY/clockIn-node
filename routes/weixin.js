var crypto = require('crypto');
const { WEIXIN_TOKEN, appID, appsecret } = require('../utils/const');
let http = require('request');
// 微信配置URL认证
function weixinAuth(knex) {
    return function(req, res, next) {
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
function getPageToken(knex) {
    return function(req, res, next) {
        const { code } = req.query;
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appID}&secret=${appsecret}&code=${code}&grant_type=authorization_code`
        http.get(url, function(err, data, body) {
            console.log(err, data, body)
        })
    }
}

module.exports = {
    weixinAuth,
    getPageToken
};
