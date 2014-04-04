
var wechat =  require('wechat');
var List = require('wechat').List;
var async = require("async");


var dao = require("./dao");
var sam = require("./sam");
var dictDao = require("./dictDao");

//自定义参数
var _call = 1;
var _match = 2


//微信回复，第一个参数为token
module.exports = wechat('', wechat.text(function (info, req, res, next) {

  var wxcontent = info.Content;
  console.log("msg: " + wxcontent);
  async.series([
    //是否是拨打电话业务：
    function(cb){   
      dao.matchWaitParentsMenu(wxcontent, function(err, result){
        if(err == 1){  //命中
          cb(_call, result);
        }else{
          cb(err, null);
        }
      });
    }, 

    //中文关键字匹配:
    function(cb){   
      dao.searchMatchWord(wxcontent, function(err, result){
        if(err == 1){ //命中关键字
          cb(_match, result);
        }else{
          cb(err, null);
        }
      });
    },

  ], function(err, result){
    var userOpenid = info.FromUserName;
    switch(err){
      case _call:
        // console.log("_call");
        // res.end();
        try{
          res.wait(result[0]["wpmAlias"]);
        }catch(e){
          load();
        }
      break;
      case _match:
        var matchResult = result[1].regx_res;   //接口：正则表达式匹配结果
        try{
          eval(result[1]["matchAct"]);
        }catch(e){
          console.log("_match eval error: " + e);
          res.reply("");
        }
      break;
      //无法识别回复
      default:
        dao.getDefaultReply(function(err, result){
          if(err){
            dictDao.getDescribe(err, function(er, err_res){
              if(err_res){
                res.reply(err_res[0]["dictDescribe"]);
              }else{
                res.reply("系统未识别错误");
              }
            });
            return;
          }
          if(result.length == 0){
            res.reply("你好，您还未设置默认回复");
          }else{
            try{
              eval(result[0]["matchAct"]);
            }catch(e){
              console.log("_match eval error: " + e);
              res.reply("");
            }
          }
        });
      break;
    }
    
  });

}));

function load(){
  console.log("load list");
  List.clear();

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
}

//实现List.add添加“电话拨号”式回复
function loadList(req, res, next){
  load();
  res.end();
}


//*******************inner function

function getChildArray(data){
  var result = new Array();
  result.push(data["caMessage"]);
  result.push(function(info, req, res){
    var userOpenid = info.FromUserName; 
    eval(data["caAct"]);
  });
  return result;
}


module.exports.loadList = loadList; 