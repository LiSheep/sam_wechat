
var db = require("../wechat/db.js");
var dao = require("../wechat/dao.js");
var tools = require("../wechat/tools");
var sam = require("../wechat/sam");
var dictDao = require("../wechat/dictDao");

var request = require("request");
var async = require("async");
/*
db.readWaitParentMenus(function(err, res){
	if(err) {
		console.log(err);
		return;
	}
	console.log(res);
})




dao.searchMatchWord('aa', function(err, res){
	console.log(res);
});


dao.matchWaitParentsMenu('2222', function(err, res){
	console.log(err);
	console.log(res);
});



dao.getAllChildActByWpmId('3', function(err, res){
	console.log(err);
	console.log(res);
});


dao.getIPAllocByRoom("LS5s638", function(err, res){
	var res = res[0];
	console.log("您的寝室："+res.start_ip);
});


var a = tools.matchKeyWords("cx.((LS)?\\ds\\d{3})", "cx.ls1s105", "|");

console.log(a[1]);


dao.searchMatchWord("cx ls1s105", function(err, res){
	console.log(res.regx_res[1]);	
});

res.reply();
dao.getIPAllocByRoom(matchResult[1], function(err, result){var result = result[0];res.reply("您的寝室："+matchResult[1]+"ip分配为："+result.start_ip+" ~ "+result.end_ip);});

request('http://www.baidu.com', function(err, response, body){
	console.log(body);
});



var userinfo ={};
userinfo.name = "ltc";
userinfo.pass = "little";

var url = tools.samURL("http://localhost:8080", {
	path: "GetUserInfo",
	data: userinfo
});
console.log(url);

sam.vertifyUser("1", function(err, res){
	console.log(err);
	console.log(res);
})

console.log("go");
dao.checkIfUnbind("1", function(err, res){
	console.log(err);
	console.log(res);
});


dao.getUserInfoByOpenid("11", function(err, res){
	console.log(err);
	console.log(res);
});


dictDao.getDescribe("nobind", function(err, res){
	console.log(err);
	console.log(res);
})



sam.vertifyUser("12", function(err, res){
	console.log(err);
	console.log(res);
})


//微信绑定锐捷用户
dao.bindUser({
	userOpenid:"122",
	userAccount:"101811023",
	userPass:"little8622"
}, function(err, res){
	if(err){
		dictDao.getDescribe(err, function(err, res){
			if(err){
				console.log(err);
				return;
			}
			if(res){	//如果是用户错误
				console.log(res[0]["dictDescribe"]);
				return;
			}else{		//如果是系统错误
				console.log(err);
			}
		});
	}else{
		console.log(res);
	}
});

//用户绑定微信
dao.searchMatchWord("bd 1018110223 little8622", function(err, result){
	if(err == 1){ //命中关键
	    var matchResult = result.regx_res;
	    dao.bindUser({userOpenid:userOpenid, userAccount:matchResult[1], userPass:matchResult[2]}, function(err, bindres){
	      	if(err){	//绑定失败
				dictDao.getDescribe(err, function(err, dictDaores){
					if(dictDaores){	//如果是用户错误
						res.reply("绑定失败："+dictDaores[0]["dictDescribe"]);
						return;
					}
					res.reply("");
				});
			}else{
				res.reply("绑定成功！");
			}
	    });
	}
});


dao.getIPAllocByRoom("LS5s102", function(iperr, result){
	if(iperr){
		dictDao.getDescribe(iperr, function(geterr, dictDaores){
			if(dictDaores){
				res.reply("查询寝室失败："+dictDaores[0]["dictDescribe"]);
				return;
			}
		}
	}
	//查询成功
	var result = result[0];
	res.reply("您的寝室："+matchResult[1]+"ip分配为："+result.start_ip+" ~ "+result.end_ip);
});


dao.searchMatchWord("bd 1018110223 little8622", function(err, result){
	if(err == 1){ //命中关键
	    var matchResult = result.regx_res;
	    console.log(matchResult);
	    dao.bindUser({userOpenid:"1", userAccount:matchResult[1], userPass:matchResult[2]}, function(err, bindres){
	      	if(err){	//绑定失败
				dictDao.getDescribe(err, function(err, dictDaores){
					if(dictDaores){	//如果是用户错误
						res.reply("绑定失败："+dictDaores[0]["dictDescribe"]);
						return;
					}
					res.reply("");
				});
			}else{
				res.reply("绑定成功！");
			}
	    });
	}
});


userOpenid="1"
//解绑IP
async.waterfall([
	//判断用户是否可以解绑IP
	function(callback){
		dao.getUserInfoByOpenid(userOpenid, function(err, info_res){
			if(err){
				callback(err, null);
				return;
			}
			if(info_res){
				callback(null, info_res);

			}else{
				callback("nobind", null);
			}
		});
	},

	//验证用户帐号密码是否正确
	function(userInfo, callback){
		sam.vertifyPass(userInfo, function(err, pass_res){
			if(err){
				callback(err, null);
				return;
			}
			if(pass_res){	//密码正确
				callback(null, userInfo);

			}else{
				callback("passerr", null);
			}
		});
	},
	//验证用户解绑时间是否大于指定时间(30天)
	function(userInfo, callback){
		dao.checkIfUnbind(userOpenid, function(err, ciu_res){
			if(err){
				callback(err, null);
				return;
			}
			if(ciu_res){
				callback(null, userInfo);
			}else{
				callback("cannotunbind", null)
			}
		});
	},
	//解绑
	function(userInfo, callback){
		sam.unBindIP(userInfo, function(err, ubi_res){
			if(err){
				callback(err, null);
				return;
			}
			if(ubi_res){
				callback(null, userInfo.userOpenid);
			}else{
				callback("unbinderr", null);
			}
		});
	},
	//更新解绑时间
	function(userOpenid, callback){
		dao.updateUnbindDate(userOpenid, function(err, uud_res){
			if(err){
				callback(err, null);
				return;
			}
			callback(null, null);
		});
	}
	
], function(err ,results){
	if(err){
		dictDao.getDescribe(err, function(er, err_res){
			if(err_res){
				res.reply(err_res[0]["dictDescribe"]);
			}else{
				res.reply("系统为识别错误");
			}
		});
	}else{
		res.reply("解绑成功！");
	}
});


userOpenid="1"
//解绑IP
async.waterfall([
	//判断用户是否存在
	function(callback){
		dao.getUserInfoByOpenid(userOpenid, function(err, info_res){
			if(err){
				callback(err, null);
				return;
			}
			if(info_res){
				callback(null, info_res);

			}else{
				callback("nobind", null);
			}
		});
	},

	//验证用户帐号密码是否正确
	function(userInfo, callback){
		sam.vertifyPass(userInfo, function(err, pass_res){
			if(err){
				callback(err, null);
				return;
			}
			if(pass_res){	//密码正确
				callback(null, userInfo);

			}else{
				callback("passerr", null);
			}
		});
	},
	function(userInfo, callback){
		sam.getUserInfo(userInfo, function(err, fbt_res){
			if(err){
				callback(err, null);
				return;
			}
			
			callback(null, fbt_res);

		});
	}

	
], function(err ,results){
	if(err){
		dictDao.getDescribe(err, function(er, err_res){
			if(err_res){
				console.log(err_res);
				//res.reply(err_res[0]["dictDescribe"]);
			}else{
				console.log("其他错误");
				//res.reply("系统未识别错误");
			}
		});
	}else{
		console.log(results);
	}
});

*/

dictDao.getTail(function(err, res){
	console.log(err);
	console.log(res);
});