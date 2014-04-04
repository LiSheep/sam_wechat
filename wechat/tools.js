var request = require("request");

(function(){
	var tools = {};

	//keys: 正则表达参数，以splitChar分割
	//strings: 要验证的字符串
	tools.matchKeyWords = function(keys, strings, splitChar){
		var regx_strs = keys.split(splitChar);
		for(var i = 0; i < regx_strs.length; i++){
			if(!regx_strs[i])	//防止多输入了一个分隔符
				continue;
			var regx = new RegExp(regx_strs[i], "i");
			if(regx.test(strings)){
				return regx.exec(strings);
			}
		}
		return false;
	}

	//options: path(请求路径), data(请求的json数据), 
	tools.samURL = function(url, options){
		options = options || {};
		if(options.path){	//
			url += "/";
			url += options.path;
		}else{
			return null;
		}
		if(options.data){
			var jsonStr = JSON.stringify(options.data);
			url += "?data=";
			url += jsonStr;
		}else{
			return null;
		}
		return url;
	}

	//date1-date2
	tools.diffDate = function(date1, date2){
		return (date1.getTime() - date2.getTime())/(1000*3600*24);
	}

	//cb(err, obj)
	tools.post = function(murl, cb){
		request.post({
			url:murl,
		},function(err, res, body){
			try{
				var obj = JSON.parse(body);
			}
			catch(e){
				console.log("tools.post err"+ e);
				cb("syserr", null);
				return;
			}
			cb(err, obj);
		});
	}


	tools.NewGuid = function() {
	    var S4 = function() {
	       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	    };
	    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	module.exports = tools;
}());