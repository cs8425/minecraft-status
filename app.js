var cluster = require('cluster');
var net = require('net');
var child_process = require('child_process');
var spawn = child_process.spawn;

var config = {
	port: 8080,
	helper: '/home/pi/spigot_server/minecraft',
	mcport: 25565,
};

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});

	var today = 1;
	var backup = function(){
		var now = new Date();
		if(now.getHours() == 3 && today){
			console.log('start to backup!');
			today = 0;
//			var child = spawn(config.helper, ['backup'], {stdio: 'ignore'});
			var child = spawn(config.helper, ['backup']);
			child.stdout.on('data', function (data) {
				console.log('stdout:', data.toString());
			});
			child.stderr.on('data', function (data) {
				console.log('stderr:', data.toString());
			});
			child.on('close', function (code) {
				console.log('backup end!');
			});
		}else{
			if(now.getHours() == 1) today = 1;
		}
	}

	var check_alive = function(){
		var client = net.connect({port: 25565}, function() { //'connect' listener
			console.log('connected to server!');
			client.end();
			//client.write('world!\r\n');
		});
		client.on('data', function(data) {
			console.log(data.toString());
			client.end();
		});
		client.on('error', function(err) {
			console.log('o.0!', err);
			spawn(config.helper, ['restart'], {stdio: 'ignore'});
		});
		client.on('end', function() {
			console.log('disconnected from server');
		});
	}

	var WDT = function(){
			check_alive();
			backup();
			var t = setTimeout(WDT, 30*1000);
	}
	WDT();
}else{

	var server = require('./server.js')(config);

	server.listen(config.port, function() {
		console.log('\tserver listening on port', config.port);
	});
}


