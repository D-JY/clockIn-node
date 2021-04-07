var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
const { checkLogin } = require('./utils/jwt');
const { getToken } = require('./routes/weixin');


var app = express();
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port: '5432',
    user : 'postgres',
    password : 'admin',
    database : 'postgres'
  },
  debug: true
});

// app.use(logger('dev'));
app.use(express.urlencoded({extended: true }));
app.use(express.json());

app.use(cors()); // 注入cors模块解决跨域

// PC端接口
app.use('/api', checkLogin); // 校验token
app.use('/api', require('./routes/login').login(knex));
app.use('/api', require('./routes/users').user(knex));

// 微信端接口
app.use('/weixin', checkLogin); // 检查是否带有openid
app.use('/weixin', require('./routes/weixin').weixin(knex));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
