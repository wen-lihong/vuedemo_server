var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var index = require('./routes/index');
var goods = require('./routes/goods');
var users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//登录拦截
app.use(function(req,res,next){
   if(req.cookies.userId){
   	next()
   }else{
    console.log(req.path)
    
   	if(req.originalUrl=="/users/login" ||req.path=="/goods"){
      next()
   	}else{
   		res.json({
   			status:'1',
   			msg:'',
   			result:"当前未登录"
   		})
   	}
   }
})
app.use('/', index);
app.use('/users', users);
app.use('/goods', goods);
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
