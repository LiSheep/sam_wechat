
var config = {};

var mysqlInfo = {  
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : "dljdchat"
}

config.mysqlInfo = mysqlInfo;

var redisInfo = {host:'222.26.224.56', port:6379, pass:''};

config.redisInfo = redisInfo;

config.samURL = "http://localhost:8080/sam";

//用户可以解绑的时间
config.unbindTime = 30;

//用户可以重新绑定微信帐号的时间
config.rebindWxTime = 30;

module.exports = config;
