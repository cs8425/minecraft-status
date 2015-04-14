var fs = require('fs');
var tool = require('./tool.js');

var cpu2 = function(){
	var cpu = {};
	var val = 0;
	var info_l = null;
	var update = function(){
		fs.readFile('/proc/stat', function (err, data) {
			if (err) throw err;
			var info = data.toString().split('\n')[0].replace(/[ ]+/gi,' ').split(' ');
			if(info_l){
				var delta = [];
				var total = 0;
				for(var i=1; i<11; i++){
					var d = info[i] - info_l[i];
					delta.push(d);
					total += d;
				}
				var idle = delta[3];
				//console.log(idle, total, (total-idle)/total);
				val =  100.0 * (total-idle) / total;
			}
			info_l = null;
			info_l = info;
		});
		var t = setTimeout(update, 1000);
	}
	update();
	cpu.get = function(){
		return val;
	}
	return cpu;
}



var cpu = tool.cpu();
//var cpu = cpu2();
var update = function(){

	console.log('cpu', cpu.get());
	var t = setTimeout(update, 1000);

}
var t = setTimeout(update, 2*1000);

