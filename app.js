var cluster = require('cluster');

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});
}else{

	var config = {
		port: 8080,
		helper: './minecraft'
	};

	var server = require('./server.js').server;

	server.listen(config.port, function() {
		console.log('\tserver listening on port', config.port);
	});
}

