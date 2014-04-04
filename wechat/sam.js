var request = require("request");
var url = require('url');
var async = require("async");

var tools = require("./tools");
var config = require("../config");


//sam api 验证接口

(function(){
	var sam = {};

	//验证用户帐号密码是否匹配
	//true:密码正确
	sam.vertifyPass = function(userInfo, cb){
		var url = tools.samURL(config.samURL, {
			path:"VertifyUser",
			data:userInfo
		});
		tools.post(url, function(err, obj){
			if(err){
				console.log(err);
				cb(err, false);
				return;
			}if(obj.result){
				cb(null, true);
			}else{
				cb(null, false);
			}
		});
	}

	//解绑用户IP
	//cb(err, result/*true|false*/)
	//userInfo userOpenid, userAccount
	sam.unBindIP = function(userInfo, cb){
		if(!userInfo){
			cb("keyEmpty: sam.unBindIP", null);
			return;
		}
		var url = tools.samURL(config.samURL, {
			path:"UnbindIP",
			data:userInfo
		});
		tools.post(url, function(err, obj){
			if(err){
				console.log(err+'sam.unBindIP');
				cb("syserr", null);
				return;
			}
			if(obj.result){
				cb(null, true);
			}else{
				cb(null, false);
			}
		});
	}


	//查询用户到期事件
	sam.getUserInfo = function(userInfo, cb){
		if(!userInfo){
			cb("keyEmpty: sam.unBindIP", null);
			return;
		}
		var url = tools.samURL(config.samURL, {
			path:"GetUserInfo",
			data:userInfo
		});
		tools.post(url, function(err, obj){
			if(err){
				console.log(err+'sam.getUserInfo');
				cb("syserr", null);
				return;
			}else if(obj.result == ""){
				cb("finderr", null);
				return;
			}
			cb(err, obj);
		});
	}
	module.exports = sam;
}());