var net = require('net');
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
	console.log(err);
});
client.on('end', function() {
	console.log('disconnected from server');
});

