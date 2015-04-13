var cluster = require('cluster');
var child_process = require('child_process');
var spawn = child_process.spawn;

var config = {
	port: 8080,
	helper: '/home/pi/spigot_server/minecraft'
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
				var t = setTimeout(backup, 60*1000);
			});
		}else{
			if(now.getHours() == 1) today = 1;
			var t = setTimeout(backup, 60*1000);
		}
	}
	backup();
}else{

	var server = require('./server.js')(config);

	server.listen(config.port, function() {
		console.log('\tserver listening on port', config.port);
	});
}


