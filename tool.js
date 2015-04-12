var child_process = require('child_process');
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

var exports = module.exports = {};

exports.temp = function(){
	return spawnSync('cat', ['/sys/class/thermal/thermal_zone0/temp']).stdout / 1000.0;
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
	var cpu = spawnSync('top', ['-bn1']).output.toString().split('\n')[2].match(/.*(\d+\.\d+) us,.*/)[1] * 1.0;
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


