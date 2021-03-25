module.exports = {
    PRIVATE_KEY: 'NODEDEMO', // 私钥
    JWT_EXPIRED: 1000 * 60 * 60 * 24, // 过期时间24小时
    WHITE_LIST: ['/api/login', '/api/register']
}