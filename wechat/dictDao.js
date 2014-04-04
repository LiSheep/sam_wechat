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

	module.exports = dictDao;
}());