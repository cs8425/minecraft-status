// copy and modify from gavinuhma's node-asset-cache
// url: https://github.com/gavinuhma/node-asset-cache/blob/master/lib/asset-cache.js
module.exports = function(config){

var http = require('http');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;

var tool = require('./tool.js');
//var board = require('./board.js');

//var exports = module.exports = {};
config.dir = path.join(process.cwd(), 'public');
/*var config = {
	dir: path.join(process.cwd(), 'public'),
	port: 8080,
	helper: '/home/pi/spigot_server/minecraft'
};*/

var logs = [];

var exe = function(exec, arg, cb){
	var child = spawn(exec, arg);
	var output = '';
	child.stdout.on('data', function (data) {
		//console.log('stdout:', data, data.toString());
		output += data;
	});
	child.on('close', function (code) {
		//console.log('child process exited with code ' + code);
		cb(code, output);
	});
}

var trim_conter = 5;
var trim = function(arr){
	var out;
	trim_conter++;
	if(arr.length > 300){
		out = arr.slice(1);
	}else{
		out = arr;
	}
	arr = null;
	if(trim_conter == 5){
		trim_conter = 0;
		var last = out[out.length - 1];
		/*var str = '[' +last[0].toString() + ']';
		str += '\t' + last[3];
		str += '\t' + last[4];
		str += '\t' + last[1];
		str += '\t' + last[2];*/
		//log_file.write(JSON.stringify(last));
		fs.appendFile(path.join(config.dir, 'log'), JSON.stringify(last) + '\n', function (err) {
			if (err) throw err;
			console.log('append:', last);
		});
	}
	return out;
}

var update = function(){
	var temp = tool.temp();
	var cpu = tool.cpu();
	var mem = tool.mem_arr();

	exe(config.helper, ['tps'], function(code, data){
		var tps = data.match(/(\d+\.\d+)/g);
		//console.log('tps', data, tps);
		exe(config.helper, ['cmd', 'list'], function(code, data){
			var online = data.match(/(\d+\/\d+)/g)[0].split('/');
			//console.log('online', data, online);
			logs.push([new Date(), temp, cpu, mem, tps[0]*1.0, online[0]*1.0]);
			logs = trim(logs);
			var t = setTimeout(update, 60*1000);
		});
	});
}
update();

var loadFile = function(file, ifNoneMatch, callback) {
//console.log(file);
  file = (file == '/') ? 'index.html': path.join(config.dir, file);
  fs.stat(file, function(err, stat) {
    if (err) {
      return callback(err, null);
    }
    var thisEtag = '"' + stat.size + '-' + stat.mtime.getTime() + '"';
    if (ifNoneMatch && ifNoneMatch == thisEtag) {
      return callback(null, true, thisEtag);
    }
    fs.readFile(file, function(err, data) {
      callback(err, err ? null : data, false, thisEtag);
    });
  });
};

var server = http.createServer(handleRequest);

function handleRequest(req, res) {
console.log(req.url);
	var send_file = function (err, body, notModified, etag) {
		var status;

		if (err) {
			//console.error(err);
			status = notModified ? 304 : 404;
		} else {
			status = notModified ? 304 : 200;
		}

		var ct = '';

		if (req.url.indexOf('.css') !== -1) {
			ct = 'text/css';
		} else if (req.url.indexOf('.js') !== -1) {
			ct = 'text/javascript';
		} else if (req.url.indexOf('.html') !== -1) {
			ct = 'text/html';
		} else if (req.url.indexOf('.png') !== -1) {
			ct = 'image/png';
		}

		res.writeHead(status, {
			'content-type': ct,
			'cache-control': 'must-revalidate,private,max-age=1209600',
			'Expires': new Date(Date.now() + 1209600000).toUTCString(),
			'etag': etag
		});

		if (notModified) {
			res.end();
		} else {
			res.end(body);
		}
	}

	switch(req.url) {
		case '/api/log':
			res.writeHead(200, {
				'content-type': 'text/javascript',
				'cache-control': 'private,max-age=30',
				'Expires': new Date(Date.now() + 30000).toUTCString()
			});
			res.end(JSON.stringify(logs));
		break;

		case '/api/board':
			res.writeHead(200, {
				'content-type': 'text/javascript',
				'cache-control': 'private,max-age=0,no-cache',
				'Expires': new Date().toUTCString()
			});
			res.end();
			//board(req, res);
		break;

		case '/board':
			loadFile('board.html', req.headers['if-none-match'], send_file);
		break;

		default:
			loadFile(req.url, req.headers['if-none-match'], send_file);
	}
}

//exports.server = server;
	return server;
}


