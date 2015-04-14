var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

var exports = module.exports = {};

exports.temp = function(){
	var temp = {};
	var val = 0;
	var update = function(){
		fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (err, data) {
			if (err) throw err;
			val = data.toString() / 1000.0;
		});
		var t = setTimeout(update, 1000);
	}
	update();
	temp.get = function(){
		return val;
	}
	return temp;
}

exports.mem = function(){
	var raw = spawnSync('free').output.toString().replace(/ +/g, ' ').split('\n');
	var raw = raw[1].split(' ');
	var mem = {};
	mem.total = raw[1]*1.0;
	mem.used = raw[2]*1.0;
	mem.free = raw[3]*1.0;
	mem.shared = raw[4]*1.0;
	mem.buffers = raw[5]*1.0;
	mem.cached = raw[6]*1.0;
	mem.used -= mem.cached + mem.buffers;
	mem.free += mem.cached + mem.buffers;
	return mem;
}

exports.cpu = function(){
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
				var idle = delta[3] + delta[4];
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

exports.mem_arr = function(){
	var raw = spawnSync('free').output.toString().replace(/ +/g, ' ').split('\n');
	var raw = raw[1].split(' ');
	var mem = [];
	mem.push(raw[1]*1.0);
	mem.push(raw[2]*1.0 - raw[5]*1.0 - raw[6]*1.0);
	mem.push(raw[3]*1.0 + raw[5]*1.0 + raw[6]*1.0);
	mem.push(raw[4]*1.0);
	mem.push(raw[5]*1.0);
	mem.push(raw[6]*1.0);
	return mem;
}


