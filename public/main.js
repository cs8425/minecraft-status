function gen(container, options){
	var plot = {};
	/*var online.container = document.getElementById('online');
	var online.options = {
		sampling: true,
		legend: true,
		drawPoints: {style: 'circle', enabled:true, size:3},
		catmullRom: false,
		start: startPoint,
		end: endPoint
	};*/
	plot.dataset = new vis.DataSet({
		type: {start: 'ISODate', end: 'ISODate' }
	});
	plot.graph2d = new vis.Graph2d(container, plot.dataset, options);
	return plot;
}

var now = moment();
var startPoint = now -  80 * 60 * 1000;
var endPoint = now + 5 * 60 * 1000;

var online = gen($('#online')[0], {
	defaultGroup: 'onlines',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint
});

var TPS = gen($('#TPS')[0], {
	defaultGroup: 'TPS',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint
});

var temp = gen($('#temp')[0], {
	defaultGroup: 'temp',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint
});

var cpu = gen($('#cpu')[0], {
	defaultGroup: 'CPU',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: {parametrization: 'uniform'},
	shaded: {orientation: 'bottom'},
	start: startPoint,
	end: endPoint
});

var mem = gen($('#mem')[0], {
	defaultGroup: 'mem used',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: {parametrization: 'uniform'},
	shaded: {orientation: 'bottom'},
	start: startPoint,
	end: endPoint
});


var mem_options = {
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: {parametrization: 'uniform'},
	start: startPoint,
	end: endPoint
};
/*
var dataset = new vis.DataSet({
	type: {start: 'ISODate', end: 'ISODate' }
});
var groups = new vis.DataSet();
groups.add({
id: 0,
content: 'onlines',
options: {
    catmullRom: {
        parametrization: 'uniform'
    }
}});

groups.add({
id: 1,
content: 'TPS',
options: {
    drawPoints: false,
    catmullRom: {
        parametrization: 'uniform'
    }
}});

groups.add({
id: 2,
content: 'mem used',
options: {
    drawPoints: false,
    catmullRom: {
        parametrization: 'uniform'
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    }
}
});

groups.add({
id: 3,
content: 'temp',
options: {
    catmullRom: 'uniform'
}});

var graph2d = new vis.Graph2d(container, dataset, groups, options);*/


// online, TPS, temp, cpu, mem
function render(newData) {
	var now = moment();
	var startPoint = now -  80 * 60 * 1000;
	var endPoint = now + 20 * 60 * 1000;

	online.dataset.clear();
	online.dataset.add(newData[0]);
	online.graph2d.setWindow(startPoint, endPoint, {animate: false});

	TPS.dataset.clear();
	TPS.dataset.add(newData[1]);
	TPS.graph2d.setWindow(startPoint, endPoint, {animate: false});

	temp.dataset.clear();
	temp.dataset.add(newData[2]);
	temp.graph2d.setWindow(startPoint, endPoint, {animate: false});

	cpu.dataset.clear();
	cpu.dataset.add(newData[3]);
	cpu.graph2d.setWindow(startPoint, endPoint, {animate: false});

	mem.dataset.clear();
	mem.dataset.add(newData[4]);
	mem.graph2d.setWindow(startPoint, endPoint, {animate: false});
}


var update = function(){
	$.ajax({
		method: "GET",
		url: "/api/log",
		dataType: "json",
		error:  function( jqXHR, textStatus, errorThrown ){},
		success: function(data, textStatus, jqXHR ){
			var count = data.length;
			var newData = [ [], [], [], [], []];
			for (var i = 0; i < count; i++) {
				var row = data[i];
				var t = moment(row[0]);
				// online, TPS, temp, cpu, mem
				newData[0].push({x: t, y: row[5]});
				newData[1].push({x: t, y: row[4]});
				newData[2].push({x: t, y: row[1]});
				newData[3].push({x: t, y: row[2]});
				newData[4].push({x: t, y: row[3][1]/1024.0});

			}
console.log(newData);
			render(newData);
		}
	});
	var t = setTimeout(update, 60*1000);
}
update();



