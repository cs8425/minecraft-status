var cluster = require('cluster');

var config = {
	port: 8080,
	db: 'board.json'
};

if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		cluster.fork();
	});

}else{

	var server = require('./server.js')(config);

	server.listen(config.port, function() {
		console.log('\tserver listening on port', config.port);
	});
}


