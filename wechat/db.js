var mysql = require('mysql');
var async = require("async");

var config = require("../config");
var tools = require("./tools");
(function(){
	db = {};
	
	//mysql数据库连接池
	var pool  = mysql.createPool(config.mysqlInfo);

	//cb(err, result)
	//WaitParentMenu
	db.readAllWaitParentMenus = function(cb){
		var sql = "SELECT * FROM WaitParentMenu";
		//注意，getConnection()是否需要？
		pool.query(sql, cb);
	}

	//cb(err, result)
	//ChildAct
	db.readAllChildAct = function(cb){
		var sql = "SELECT * FROM ChildAct";
		pool.query(sql, cb);
	}

	//cb(err, result)
	//ChildAct
	db.readChildActById = function(caId, cb){
		var sql = "SELECT * FROM ChildAct WHERE caId = ?";
		pool.query(sql, caId, cb);
	}

	db.readChildsByPwmId = function(wpmId, cb){
		var sql = "SELECT ca.caId, ca.caMessage, ca.caAct, wpm.wpmId, wpm.wpmKeyWord, wpm.wpmAlias FROM ChildAct AS ca LEFT JOIN WaitParentMenu AS wpm ON wpm.wpmId = ca.wpmId WHERE wpm.wpmId = ?";
		pool.query(sql, wpmId, cb);
	}

	//cb(err, result)
	//MatchTable
	db.readAllMatchTable = function(cb){
		var sql = "SELECT * FROM MatchTable";
		pool.query(sql, cb);
	}

	db.readDefaultReply = function(cb){
		var sql = "SELECT * FROM MatchTable WHERE matchWord = ?";
		pool.query(sql, 'default', cb);
	}

	//userinfo
	//cb(err, result)
	db.readUserInfoByOpenid = function(userOpenid, cb){
		var sql ="SELECT * FROM UserInfo WHERE userOpenid = ?";
		pool.query(sql, userOpenid, cb);
	}
	
	db.deleteUserInfoByOpenid = function(userOpenid, cb){
		var sql ="DELETE FROM UserInfo WHERE userOpenid = ?";
		pool.query(sql, userOpenid, cb);
	}

	db.insertUserInfo = function(userInfo, cb){
		var sql = "INSERT INTO UserInfo(userId, userOpenid, userAccount, userPass, userRegDate ) VALUES(?,?,?,?,?)";
		var id = tools.NewGuid();
		pool.query(sql, [id, userInfo.userOpenid, userInfo.userAccount, userInfo.userPass, new Date()], cb);
	}

	db.updateUnbindDate = function(userOpenid, cb){
		var sql = "UPDATE UserInfo SET userUnbindDate = ? WHERE userOpenid = ?";
		pool.query(sql, [new Date(), userOpenid], cb);
	}

	db.readUnbindDateByUserOpenId = function(userOpenId, cb){
		var sql = "SELECT userUnbindDate FROM UserInfo WHERE userOpenid = ?";
		pool.query(sql, userOpenId, cb);
	}

	//IPAlloc
	//cb(err, result)
	db.readIPAllocByRoom = function(room, cb){
		var sql = "SELECT * FROM IPAlloc WHERE room = lower(?)";
		pool.query(sql, room, cb);
	}

	//dictionary,数据字典
	db.getDescribe = function(key, cb){
		var sql = "SELECT dictDescribe FROM dictionary WHERE dictKey = ?";
		pool.query(sql, key, cb);
		
	}

	module.exports = db;

}());