var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cors = require('cors');
const { checkLogin } = require('./utils/jwt');


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

app.use(checkLogin); // 校验token

app.use('/weixin', require('./routes/weixin').weixinAuth(knex));
app.get('/weixin/getOpenId', require('./routes/weixin').getPageToken(knex));

app.post('/api/login', require('./routes/login').login(knex));
app.get('/api/user', require('./routes/users').user(knex));

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
