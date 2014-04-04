var db = require("./db");
var tools = require('./tools');
var config = require('../config');

var async = require("async");
var request = require("request");
var sam = require("./sam");

(function(){
	dao = {};

	//*******************wait拨号**********************

	dao.getAllWaitParentsMenu = function(cb){
		db.readAllWaitParentMenus(cb);
	}

	dao.matchWaitParentsMenu = function(wxcontent, cb){

		if(!wxcontent){ 
			cb('keyEmpty:dao.matchWaitParentsMenu', null);
			return;
		}

		db.readAllWaitParentMenus(function(err, result){
			if(err){
				console.log("error, dao.matchWaitParentsMenu: " + err);
				cb("syserr", null);
				return;
			}else{
				for(i = 0; i < result.length; i++){
					var keys = result[i]["wpmKeyWord"];
					if(tools.matchKeyWords(keys, wxcontent, '|')){
						cb(1, result[i]);	//如果命中
						return;
					}
				}
				cb(null, null);
			}
		});
	}

	dao.getChildActById = function(caId, cb){
		if(!caId) {
			cb("keyEmpty:dao.getChildActById", null);
			return;
		}

		db.readChildActById(caId, function(err, res){
			if(err){
				cb(err, null);
				return;
			}
			if(res.length == 0){	//未找到孩子
				cb("没有匹配的子功能", null);
			}else{
				cb(err, res);
			}
		});
	}

	//wpm left join ChildAct
	dao.getAllChildActByWpmId = function(wpmId, cb){
		if(!wpmId){
			cb("keyEmpty:dao.getAllChildActByWpmId", null);
			return;
		}
		db.readChildsByPwmId(wpmId, function(err, res){
			if(err){
				cb(err, null);
				console.log("err dao.getAllChildActByWpmId:" + err);
				return;
			}
			if(res.length == 0){
				cb("keyEmpty: 没有找到wpmId", null);
			}else{
				cb(err, res);
			}
		});
	}

	//********************中文文字匹配*********************

	dao.searchMatchWord = function(wxcontent, cb){
		if(!wxcontent){ 
			cb('keyEmpty: dao.searchMatchWord', null);
			return;
		}
		db.readAllMatchTable(function(err, result){
			if(err){
				console.log("err: dao.searchMatchWord: " +err);
				cb("syserr", null);
				return;
			}else{
				//遍历匹配正则表达
				for(i = 0; i<result.length; i++){
					var keys = result[i]['matchWord'];
					var txt_result = tools.matchKeyWords(keys, wxcontent, '|');
					if(txt_result){
						result[i].regx_res = txt_result;	//把分组结果传进去
						cb(1, result[i]);	//如果命中
						return;
					}
				}
			}
			cb(null, null);
		});
	}

	//******************寝室IP地址分配********************

	//cb(err, res) 如果没有err，res保证不为空
	dao.getIPAllocByRoom = function(room, cb){
		if(!room){
			cb("keyEmpty: dao.getIPAllocByRoom", null);
			return;
		}
		db.readIPAllocByRoom(room, function(err, res){
			if(err){
				console.log("error: dao.getIPAllocByRoom" + err);
				cb("syserr", null);
				return;
			}
			if(!res || res.length == 0){	//没有查到结果
				cb("noroom", null);
				return;
			}else{
				cb(err, res);
			}
		});
	}


	//*********************默认回复*********************
	dao.getDefaultReply = function(cb){
		db.readDefaultReply(function(err, res){
			if(err){
				console.log("error: dao.getDefaultReply" + err);
				cb("syserr", null);
				return;
			}
			cb(null, res);
		});
	}

	//********************用户绑定信息******************

	//查看用户是否绑定微信
	//cb(err, res) 
	//	res:是:返回锐捷帐号（userAccount），否：返回null
	dao.getUserInfoByOpenid = function(userOpenid, cb){
		if(!userOpenid){
			cb("keyEmpty: dao.getUserInfoByOpenid", null);
			return;
		}
		db.readUserInfoByOpenid(userOpenid, function(err, res){
			if(err){
				console.log("error dao.getUserInfoByOpenid: "+err);
				cb("syserr", null);
				return;
			}
			if(res && res.length > 0){
				cb(null, res[0]);
			}else{
				cb(null, null);
			}

		});
	}

	//更新用户解绑IP时间
	dao.updateUnbindDate = function(userOpenid, cb){
		db.updateUnbindDate(userOpenid, function(err, res){
			if(err){
				cb("syserr", null);
				console.log("error dao.updateUnbindDate " + err);
				return;
			}
			cb(null, res);
		});
	}

	//cb(err, res/*true: 可以解绑, false:不可以解绑*/)
	//查看userOpenid是否可以解绑IP
	dao.checkIfUnbind = function(userOpenid, cb){
		if(!userOpenid){
			cb("keyEmpty: dao.checkIfUnbind", null);
			return;
		}
		db.readUserInfoByOpenid(userOpenid, function(err, res){
			if(err){
				console.log(err);
				cb("syserr", null);
				return;
			}
			if(res.length == 0){	//用户未绑定
				cb("nobind", null);
				return;
			}
			if(res[0].userUnbindDate){
				var now = new Date();
				var date = res[0].userUnbindDate;
				if(tools.diffDate(now, date) >= config.unbindTime){	//时间大于30天可以解绑
					cb(null, true);
				}else{
					cb(null, false);
				}
			}else{
				cb(null, true);
			}
		});
	}

	//微信绑定用户
	//cb(err, res)
	//err: 数据字典
	//res: 成功返回true，不成功调用数据字典(err)，输出错误信息
	//userInfo需要 userOpenid, userAccount, userPass
	dao.bindUser = function(userInfo, cb){
		async.series([
			function(callback){
				dao.checkIfRebindWX(userInfo.userOpenid, function(err, res){
					if(err){
						callback(err, null);
					}
					if(!res){	//res为false，不能重新绑定
						callback("cannotrebindwx", null);
					}else{
						callback(null, null);
					}
				});
			},
			function(callback){		//1.删除用户,如果没有删除为空
				db.deleteUserInfoByOpenid(userInfo.userOpenid, callback);
			},
			function(callback){		//2.验证用户帐号、密码
				sam.vertifyPass(userInfo, function(err, res){
					if(err){
						console.log("dao.bindUser: " + err);
						callback("syserr", null);
						return;
					}
					else if(!res){	//没找到数据
						callback("passerr", null);
					}else{
						callback(null, null);
					}
				});
			},
			function(callback){		//3.写入数据库绑定用户
				db.insertUserInfo(userInfo, function(err, res){
					if(err){
						console.log("dao.bindUser db.insertUserInfo: " + err);
						callback("syserr", null);
						return;
					}
					callback(null, res);
				});
			}
		], function(err, res){
			cb(err, res);
		});
	}

	//查询用户是否可以重新绑定微信
	//userInfo: userOpenid
	//return: true ,大于重新绑定时间，可以重新绑定;false，相反。
	dao.checkIfRebindWX = function(userOpenid, cb){
		if(!userOpenid){
			cb("keyEmpty: dao.checkIfRebindWX", null);
			return;
		}
		db.readUserInfoByOpenid(userOpenid, function(err, res){
			if(err){
				console.log("dao.checkIfRebindWX: " + err);
				callback("syserr", null);
				return;
			}
			if(res.length == 0){	//没有查询到该用户可以解绑
				cb(null, true)
			}else{
				cb(null, tools.diffDate(new Date(), res[0]["userRegDate"]) > config.rebindWxTime);
			}
		});

	}
	

	module.exports = dao;
}());