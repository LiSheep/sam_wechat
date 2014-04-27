var db = require("./db");

//数据字典
(function(){
	dictDao = {};

	dictDao.getDescribe = function(key, cb){
		if(!key){
			console.log("keyEmpty: dictDao.getDescribe");
			cb("keyEmpty", null);
			return;
		}
		db.getDescribe(key, function(err, res){
			if(err){
				console.log("dictDao.getDescribe " + err);
				cb("1", null)
			}else{
				cb(null, res);
			}
		});
	}

	dictDao.getTail = function(cb){
		db.getDescribe("tail", function(err, res){
			if(err){
				console.log("dictDao.getTail" + err);
				cb("1", null);
			}
			else{
				if(res[0] == undefined)
					cb(null, "");
				else
					cb(null, res[0]["dictDescribe"]);
			}
		});
	}

	module.exports = dictDao;
}());