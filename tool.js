var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;

var exports = module.exports = {};

exports.temp = function(period){
	var temp = {};
	var val = 0;
	var update = function(){
		fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (err, data) {
			if (err) throw err;
			val = data.toString() / 1000.0;
		});
		var t = setTimeout(update, period);
	}
	update();
	temp.get = function(){
		return val;
	}
	return temp;
}
exports.mem = function(period){
	var mem = {};
	var val = {
		used: 0,
		free: 0,
		buffer: 0,
		cached: 0,
	};

	var update = function(){
		fs.readFile('/proc/meminfo', function (err, data) {
			if (err) throw err;
			var info = data.toString().replace(/[ ]+/gi,'').split('\n');

			//MemFree
			val.free = info[1].match(/(.*):(\d+)(kB)?/)[2] * 1.0;

			//Buffers
			val.buffer = info[2].match(/(.*):(\d+)(kB)?/)[2] * 1.0;

			//Cached
			val.cached = info[3].match(/(.*):(\d+)(kB)?/)[2] * 1.0;

			val.used = info[0].match(/(.*):(\d+)(kB)?/)[2] * 1.0 - val.free - val.buffer - val.cached;

			//console.log('mem', info, val, val.used / 1024.0);

		});
		var t = setTimeout(update, period);
	}
	update();
	mem.get = function(){
		return val;
	}
	return mem;
}

exports.cpu = function(period){
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
					total += d*1.0;
				}
				var idle = delta[3]*1.0 + delta[4]*1.0;
				//console.log(idle, total, (total-idle)/total);
				val =  100.0 * (total-idle) / total;
			}
			info_l = null;
			info_l = info;
		});
		var t = setTimeout(update, period);
	}
	update();
	cpu.get = function(){
		return val;
	}
	return cpu;
}




