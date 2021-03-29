module.exports = {
    PRIVATE_KEY: 'NODEDEMO', // 私钥
    JWT_EXPIRED: 1000 * 60 * 60 * 24, // 过期时间24小时
    WHITE_LIST: ['/api/login', '/api/register', '/weixin'],
    WEIXIN_TOKEN: 'weixin',
    appID: 'wxde1dbe682d772f62',
    appsecret: '6a00b6ee757579bc3991b80ef4bfefae'
}