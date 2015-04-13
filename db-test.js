var loki = require('lokijs');
var db = new loki('board.json', {
	autosave: true,
	autosaveInterval: 5000,
	autoload: true,
	autoloadCallback: todo
});

function todo () {
	var topic = db.getCollection('topic') || db.addCollection('topic', { indices: ['date'] });
	console.log(db.listCollections());

/*
{
id:make_rand(4)+(new Date()*1.0).toString(16),
pid:null,
topic: 'test!!',
name : 'odinaa',
email: 'odin.soap@lokijs.org',
content: "OOOXXXOXOX\nOOX",
close: false,
//sub: [ {sub} ],
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
var A = make_rand(4)+(new Date()*1.0).toString(16);
console.log(A);
topic.insert({
	id:A,
	pid:null,
	topic: 'test!!',
	name : 'odinaa',
	email: 'odin.soap@lokijs.org',
	content: "OOOXXXOXOX\nOOX",
	close: false,
	date: new Date()
});
topic.insert({
	id:make_rand(4)+(new Date()*1.0).toString(16),
	pid:null,
	topic: 'test2!!',
	name : 'odinaa',
	email: 'odin.soap@lokijs.org',
	content: "OOOXXXOXOX\nOOX",
	close: false,
	date: new Date()
});
topic.insert({
	id:make_rand(4)+(new Date()*1.0).toString(16),
	pid:A,
	topic: 'RE: test!!',
	name : 'odinaa',
	email: 'odin.soap@lokijs.org',
	content: "RE: OOOXXXOXOX\nOOX",
	close: false,
	date: new Date()
});

	//topic.insert( { name : 'odin', email: 'odin.soap@lokijs.org', date: new Date() } );
	//topic.insert( { topic: 'test!!', name : 'odinaa', email: 'odin.soap@lokijs.org', content: "OOOXXXOXOX\nOOX", sub: [{name : 'o', email: 'odin@.org', content: "OOOXXXOXOX\nOOX", date: new Date()}], date: 1 } );
/*
	console.log(topic.find({date: { $gte: 0 }}));
	console.log(
topic.where(function(o){
	return (o.meta.created > 1428926214566);
})
);*/

var out = {};
out.m = topic.findOne({id: A});
out.r = topic.find({pid: A});
console.log(out);

out = topic.where(function(o){
	return (o.pid == null);
});
console.log(out);

	console.log(db.listCollections());
	//db.loadCollection(topic);
	db.saveDatabase();
}

function make_rand(len){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < len; i++ )
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

