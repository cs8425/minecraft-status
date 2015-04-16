var fs = require('fs');
var tool = require('./tool.js');

var cpu = tool.cpu(1000);
var mem = tool.mem(1000);
var update = function(){

	console.log('cpu', cpu.get());
	console.log('mem', mem.get());
	var t = setTimeout(update, 1000);

}
var t = setTimeout(update, 2*1000);




