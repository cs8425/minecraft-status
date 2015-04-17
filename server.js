// copy and modify from gavinuhma's node-asset-cache
// url: https://github.com/gavinuhma/node-asset-cache/blob/master/lib/asset-cache.js
module.exports = function(config){

var http = require('http');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;

var tool = require('./tool.js');
var board = require('./board.js');
board.init();

config.dir = path.join(process.cwd(), 'public');

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

var trim_conter = 4;
var trim = function(arr){
	var out;
	trim_conter++;
	if(arr.length > 120){
		out = arr.slice(1);
	}else{
		out = arr;
	}
	arr = null;
	if(trim_conter == 5){
		trim_conter = 0;
		var last = out[out.length - 1];
		fs.appendFile(path.join(config.dir, 'log'), JSON.stringify(last) + '\n', function (err) {
			if (err) throw err;
			console.log('append:', last);
		});
	}
	return out;
}
var cpu_tool = tool.cpu(15*1000);
var mem_tool = tool.mem(1000);
var temp_tool = tool.temp(1000);
var update = function(){
	var temp = temp_tool.get();
	var cpu = cpu_tool.get();
	var mem = mem_tool.get();

	exe(config.helper, ['tps'], function(code, data){
		var tps = data.match(/(\d+\.\d+)/g);
		//console.log('tps', data, tps);
		var t = setTimeout(function(){
			exe(config.helper, ['cmd', 'list'], function(code, data){
// [00:41:46] [Server thread/INFO]: There are 6/36 players online:
				//var online = data.match(/(\d+\/\d+)/g)[0].split('/');
				var online = data.match(/\[[\d:]+\] \[Server thread\/INFO\]: There are (\d+)\/(\d+) players online:/m);
console.log('online', data, online);
				if(online){
					if(online.length > 2){
						//console.log('online', data, online);
						//logs.push([new Date(), temp, cpu, mem, tps[0]*1.0, online[0]*1.0]);
						logs.push([new Date(), temp, cpu, [mem.used, mem.free, mem.buffer, mem.cached], tps[0]*1.0, online[1]*1.0]);
						logs = trim(logs);
					}
				}
				var t = setTimeout(update, 60*1000);
			});
		}, 5*1000);
	});
}
var t = setTimeout(update, 16*1000);

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
//console.log(req.url);
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

	switch(true) {
		case (req.url == '/api/log'):
			res.writeHead(200, {
				'content-type': 'text/javascript',
				'cache-control': 'private,max-age=30',
				'Expires': new Date(Date.now() + 30000).toUTCString()
			});
			res.end(JSON.stringify(logs));
		break;

		case /\/api\/board.*/.test(req.url):
			res.writeHead(200, {
				'content-type': 'text/javascript',
				'cache-control': 'private,max-age=0,no-cache',
				'Expires': new Date().toUTCString()
			});
			//res.end('board');
			board.handler(req, res);
		break;

		case (req.url == '/board'):
			loadFile('board.html', req.headers['if-none-match'], send_file);
		break;

		default:
			loadFile(req.url, req.headers['if-none-match'], send_file);
	}
}

	return server;
}


