var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');
var List = require('wechat').List;
var async = require('async');
var dao = require('./wechat/dao');

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

//loadlist
async.waterfall([
    dao.getAllWaitParentsMenu,  //获取父表
    function(wpms, cb){
      wpms.forEach(function(wpm){
        dao.getAllChildActByWpmId(wpm["wpmId"], function(err, res){
          if(err){
            console.log(err);
            return;
          }
          var childs = new Array();
          for(var i = 0; i< res.length; i++){
            var data = res[i];
            childs.push(getChildArray(data));
          }
          List.add(wpm["wpmAlias"], childs);
        });
      });

    }
  ], function(err, result){
    if(err){
      console.log(err);
    }
});

function getChildArray(data){
  var result = new Array();
  result.push(data["caMessage"]);
  result.push(function(info, req, res){
    var userOpenid = info.FromUserName; 
    eval(data["caAct"]);
  });
  return result;
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
