var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.urlencoded({extended: true }));
app.use(express.json());
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // 注入cors模块解决跨域
// app.all('*', function(req, res, next) {
//   //设置允许跨域的域名，*代表允许任意域名跨域
//   res.header("Access-Control-Allow-Origin","*");
//   //允许的header类型
//   res.header("Access-Control-Allow-Headers","content-type");
//   //跨域允许的请求方式 
//   // res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
//   if (req.method.toLowerCase() == 'options') res.send(200);  //让options尝试请求快速结束
//   else next();
// })
app.use(checkLogin); // 校验token
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
