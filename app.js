var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

var chat = require("./wechat/chat");	//微信模块
var config = require("./config");

var app = express();

// all environments
app.set('port', process.argv[2] || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));


//wechat depended
app.use(express.query());
app.use(express.cookieParser());

var RedisStore = require('connect-redis')(express);	//添加session使用redis


app.use(express.session({ 
	store:  new RedisStore(config.redisInfo),
	secret: 'dljdchat_2014', 
	cookie: {maxAge: 60000}
}));



app.use('/', chat);
app.get('/loadList', chat.loadList);	//重新加载“拨号业务”List,每次开启服务前都需要运行一次

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
