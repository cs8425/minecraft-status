var exports = {};

module.exports = function(db){

	var url = require("url");
	var querystring = require("querystring");

	var loki = require('lokijs');
	var db = new loki(db, {
		autosave: true,
		autosaveInterval: 5000,
	});

	exports.handler = null;

	exports.init = function () {
		db.loadDatabase({}, todo);
	}

	function todo () {

		var topic = db.getCollection('topic') || db.addCollection('topic', { indices: ['date'] });
	/*
	{
	id:make_rand(4)+(new Date()*1.0).toString(16),
	pid:null,
	topic: 'test!!',
	name : 'odinaa',
	email: 'odin.soap@lokijs.org',
	content: "OOOXXXOXOX\nOOX",
	close: false,
	date: new Date()
	}

	{
	id:make_rand(4)+(new Date()*1.0).toString(16),
	pid:{pid},
	topic: 'test!!',
	name : 'odinaa',
	email: 'odin.soap@lokijs.org',
	content: "OOOXXXOXOX\nOOX",
	close: false,
	date: new Date()
	}

	*/

		console.log('load! ', db.listCollections());

	//	db.saveDatabase();

		exports.handler = function(req, res){
			var objectUrl = url.parse(req.url);
			var objectQuery = querystring.parse(objectUrl.query);

			switch(req.method.toUpperCase()){
				case 'GET':
					if(objectQuery.get){
	//console.log(req.method, objectQuery.get);
						var out = {};
						out.m = topic.findOne({id: objectQuery.get});
						out.r = topic.find({pid: objectQuery.get});
						res.end(JSON.stringify(out));
					}else{
						var out = out = topic.where(function(o){
							return (o.pid == null);
						});
						res.end(JSON.stringify(out));
					}
	//console.log(out);
					break;

				case 'POST':
					req.setEncoding("utf8");
					var postData = '';
					req.on("data", function (postDataChunk) {
						postData += postDataChunk;
					});

					req.on("end", function () {
						var obj = null;
						try {
							obj = JSON.parse(postData);
						}
						catch(e){

						}
	console.log('post data', obj);
						if( (check(obj.topic) || check(obj.r)) && check(obj.name) && check(obj.email) && check(obj.content)){
							topic.insert({
								id: make_rand(4)+(new Date()*1.0).toString(16),
								pid: obj.r,
								topic: obj.topic,
								name: obj.name,
								email: obj.email,
								content: obj.content,
								close: false,
								date: new Date()
							});
							res.write(JSON.stringify({status: 0, err: null}));
						}else{
							res.write(JSON.stringify({status: 1, err: '0.0?!!'}));
						}
						res.end();
					});
					break;

				default:
					res.end();
			}
	
		}
	}
	return exports;
}

function check(data){
	if(data === null) return false;
	if(typeof data === 'undefined') return false;
	if(data.replace(/[ \n　]*/gi,'') === '')  return false;
	return true;
}

function make_rand(len){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < len; i++ )
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

