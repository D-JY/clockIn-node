const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { WEIXIN_TOKEN, appID, appsecret, PRIVATE_KEY, templateId_clockIn } = require('../utils/const');
const http = require('request');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { varifyToken } = require('../utils/jwt');

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

// 获取全局token
function getToken() {
    const address = path.join(__dirname, '../') + 'data/access_token.json';
    try {
        let data = fs.readFileSync(address, 'utf8');
        // 读取到json文件有内容
        if (data) {
            data = JSON.parse(data);
            console.log(data.ExTime, Date.now(), data.ExTime > Date.now(), '时间');
            if (data.ExTime > Date.now()) {
                return { success: true, message: '获取access_token成功', ...data };
            } else { // token超时
                return getData();
            }
        } else { // 没有内容
            return getData();
        }
    } catch (error) {
        return { success: false, message: '获取token文件失败' }
    }
    
    async function getData() {
        const result = await getTokenApi();
        if (result.access_token) {
            fs.writeFile(address, JSON.stringify({ ...result, ExTime: Number(Date.now()) + Number(result.expires_in * 60) }), function(err) {
                err && console.log(err, 'token写入失败');
            })
            return { success: true, message: '获取access_token成功', ...result }
        } else {
            return { success: false, message: '获取access_token失败', ...result }
        }
    }
}

// 请求微信获取token接口
function getTokenApi() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    return new Promise((reslove, reject) => {
        http.get(url, function(err, data, body) {
            body = JSON.parse(body);
            if (body.access_token) {
                reslove(body);
            } else {
                reject(body)
            }
        })
    })
}

// 获取页面授权token
function getPageToken(req, res, next) {
    const { code } = req.query;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appID}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
    return new Promise((reslove, reject) => {
        http.get(url, function(err, data, body) {
            body = JSON.parse(body)
            console.log('getPageToken', body)
            if (body.openid) {
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
        getPageToken(req, res, next).then(async (body) => {
            console.log('getWeixinUserInfo11', body)
            const tokenData = await getToken();
            console.log(tokenData, 'tokenData');
            if (tokenData.access_token) {
                const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${tokenData.access_token}&openid=${body.openid}&lang=zh_CN`;
                http.get(url, function(err, data, result) {
                    result = JSON.parse(result)
                    console.log('getWeixinUserInfo', result, url)
                    if (result.errcode) {
                        res.json({ success: false, ...result })
                    } else {
                        console.log(result, 333)
                        const { openid, unionid, subscribe, ...userInfo } = result
                        knex('weixin_user').select().where({ openid: result.openid }).then(row => {
                            if (row.length <= 0) {
                                knex('weixin_user').insert({
                                    openid,
                                    userInfo: JSON.stringify(userInfo),
                                    createDate: moment().format('YYYY-MM-DD'),
                                    createTime: moment().format('HH:mm:ss'),
                                    unionid,
                                    subscribe
                                }).then(rows => {
                                    console.log(rows)
                                })
                            }
                        })
                        const token = jwt.sign({ data: { openid } }, PRIVATE_KEY);
                        res.json({ success: true, message: '获取微信用户信息成功', token, userInfo })
                    }
                })
            } else {
                res.json(tokenData);
            }
        }).catch(err => {
            res.json({ success: false, message: '获取openid失败', ...err });
        })
    }
}


function weixin(knex) {
    // 微信后台URL配置
    router.use('/verify', weixinAuth(knex));
    // 获取微信用户信息
    router.get('/getWeixinUserInfo', getWeixinUserInfo(knex));
    // 获取除自己关注公众号用户
    router.get('/userList', function(req, res, next) {
        const token = req.get('Authorization');
        const { openid } = varifyToken(token);
        knex('weixin_user').select().whereNot('openid', openid).where('subscribe', 1).then(data => {
            const result = data.map(val => {
                const userInfo = JSON.parse(val.userInfo);
                return { id: val.id, name: userInfo.nickname }
            })
            res.json({ success: true, message: '获取接收人列表成功', data: result });
        })
    })
    // 发送模板消息
    router.post('/sendWeiXinMsg', async function(req, res, next) {
        const { id, notice } = req.body;
        const { access_token } = await getToken();
        const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
        const token = req.get('Authorization');
        const { openid } = varifyToken(token);
        knex('weixin_user').select('userInfo').where('openid', openid)
            .then(data => JSON.parse(data[0].userInfo))
            .then(userInfo => {
                return knex('weixin_user').select('openid').where('id', id)
                    .then(data => ({ openid: data[0].openid, name: userInfo.nickname }))
            })
            .then(data => {
                http({
                    url,
                    method: 'POST',
                    body: JSON.stringify({
                        touser: data.openid,
                        template_id: templateId_clockIn,
                        data: {
                            first: {
                                value: `${data.name}给您发送消息！`,
                                color: '#173177'
                            },
                            notice: {
                                value: notice
                            }
                        }
                    })
                }, function(err, data, body) {
                    body = JSON.parse(body);
                    if (!body.errcode) {
                        res.json({ success: true, message: '发送成功' });
                    } else {
                        res.json({ success: false, message: '发送失败', ...body });
                    }
                })
            })
    })
    // 创建自定义菜单
    router.post('/createMenu', async function(req, res, next) {
        const { access_token } = await getToken();
        const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`;
        const { data } = req.body;
        http({
            url,
            method: 'POST',
            data: JSON.stringify(data)
        }, function(err, data, body) {
            body = JSON.parse(body);
            if (!body.errcode) {
                res.json({ success: true, message: '创建成功' });
            } else {
                res.json({ success: false, message: '创建失败', ...body });
            }
        })
    })
    return router;
}

module.exports = {
    weixinAuth,
    getPageToken,
    getWeixinUserInfo,
    getToken,
    weixin
};
