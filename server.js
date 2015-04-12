// copy from https://github.com/gavinuhma/node-asset-cache/blob/master/lib/asset-cache.js
var http = require('http');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;
var tool = require('./tool.js');

var exports = module.exports = {};

var config = {
	dir: path.join(process.cwd(), 'public'),
	port: 8080,
	helper: '/home/pi/spigot_server/minecraft'
};

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

var trim_conter = 0;
var trim = function(arr){
	trim_conter++;
	if(arr.length > 300){
		arr = arr.slice(1);
	}
	if(trim_conter == 5){
		trim_conter = 0;
		var last = arr[arr.length - 1];
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
			trim(logs);
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
//console.log(req.url, req.url != '/api/log');
	if(req.url != '/api/log'){
		loadFile(req.url, req.headers['if-none-match'], function(err, body, notModified, etag) {
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
				'cache-control': 'must-revalidate,private',
				'etag': etag
			});

			if (notModified) {
				res.end();
			} else {
				res.end(body);
			}
		});
	}else{
		res.end(JSON.stringify(logs));
	}
}

exports.server = server;

