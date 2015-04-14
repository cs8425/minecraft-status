function gen(container, options){
	var plot = {};
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
	defaultGroup: 'online user(s)',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint,
	dataAxis: {
		customRange: {
			left: {
			min:0
			}
		}
	}
});

var TPS = gen($('#TPS')[0], {
	defaultGroup: 'Ticks Per Sec (TPS)',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint,
	dataAxis: {
		customRange: {
			left: {
			min:0
			}
		}
	}
});

var temp = gen($('#temp')[0], {
	defaultGroup: 'temp (°C)',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: false,
	start: startPoint,
	end: endPoint,
	dataAxis: {
		customRange: {
			left: {
			min:0
			}
		}
	}
});

var cpu = gen($('#cpu')[0], {
	defaultGroup: 'CPU (%)',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: {parametrization: 'centripetal'},
	shaded: {orientation: 'bottom'},
	start: startPoint,
	end: endPoint,
	dataAxis: {
		customRange: {
			left: {
			min:0
			}
		}
	}
});

var mem = gen($('#mem')[0], {
	defaultGroup: 'MEM used (MB)',
	sampling: true,
	legend: true,
	drawPoints: {style: 'circle', enabled:true, size:3},
	catmullRom: {parametrization: 'centripetal'},
	shaded: {orientation: 'bottom'},
	start: startPoint,
	end: endPoint,
	dataAxis: {
		customRange: {
			left: {
			min:0
			}
		}
	}
});

function onChange(properties) {
	//console.log(properties);
	if(properties.byUser){
		startPoint = properties.start;
		endPoint = properties.end;

		online.graph2d.setWindow(startPoint, endPoint, {animate: false});
		TPS.graph2d.setWindow(startPoint, endPoint, {animate: false});
		temp.graph2d.setWindow(startPoint, endPoint, {animate: false});
		cpu.graph2d.setWindow(startPoint, endPoint, {animate: false});
		mem.graph2d.setWindow(startPoint, endPoint, {animate: false});
	}
}
online.graph2d.on('rangechange', onChange);
TPS.graph2d.on('rangechange', onChange);
temp.graph2d.on('rangechange', onChange);
cpu.graph2d.on('rangechange', onChange);
mem.graph2d.on('rangechange', onChange);



// online, TPS, temp, cpu, mem
function render(newData) {

	startPoint += 60*1000;
	endPoint += 60*1000;

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

var old_data = null;
var getold = function(){
	$.ajax({
		method: "GET",
		url: "/log",
		dataType: "text",
		error:  function( jqXHR, textStatus, errorThrown ){console.log(errorThrown);},
		success: function(data, textStatus, jqXHR ){
			data = data.split('\n');
			var count = data.length - 1;
			var newData = [ [], [], [], [], []];
			for (var i = 0; i < count; i++) {
//console.log(JSON.parse(data[i]));
				var row = JSON.parse(data[i]);
				if(row == null) continue;
				var t = moment(row[0]);
				// online, TPS, temp, cpu, mem
				newData[0].push({id: 'o'+i, x: t, y: row[5], label: {content:''}});
				newData[1].push({id: 'o'+i, x: t, y: row[4], label: {content:''}});
				newData[2].push({id: 'o'+i, x: t, y: row[1], label: {content:''}});
				newData[3].push({id: 'o'+i, x: t, y: row[2], label: {content:''}});
				newData[4].push({id: 'o'+i, x: t, y: row[3][1]/1024.0, label: {content:''}});
			}
			old_data = newData;
console.log(old_data);
			update();
		}
	});
}
getold();

var update = function(){
	$.ajax({
		method: "GET",
		url: "/api/log",
		dataType: "json",
		error:  function( jqXHR, textStatus, errorThrown ){},
		success: function(data, textStatus, jqXHR ){
			var count = data.length;
			var newData = [ [], [], [], [], []];
			//var newData = old_data;
			for (var i = 0; i < count; i++) {
				var row = data[i];
				var t = moment(row[0]);
				// online, TPS, temp, cpu, mem
				newData[0].push({id: 'n'+i, x: t, y: row[5], label: {content:''}});
				newData[1].push({id: 'n'+i, x: t, y: row[4], label: {content:''}});
				newData[2].push({id: 'n'+i, x: t, y: row[1], label: {content:''}});
				newData[3].push({id: 'n'+i, x: t, y: row[2], label: {content:''}});
				newData[4].push({id: 'n'+i, x: t, y: row[3][1]/1024.0, label: {content:''}});
			}
			count--;
			online.graph2d.setOptions({defaultGroup: 'online user(s): ' + newData[0][count].y});
			TPS.graph2d.setOptions({defaultGroup: 'Ticks Per Sec (TPS): ' + newData[1][count].y});
			temp.graph2d.setOptions({defaultGroup: 'temp (°C): ' + round(newData[2][count].y)});
			cpu.graph2d.setOptions({defaultGroup: 'CPU (%): ' + round(newData[3][count].y)});
			mem.graph2d.setOptions({defaultGroup: 'MEM used (MB): ' + round(newData[4][count].y)});

			for (var i = 0; i < 5; i++) {
				newData[i] = newData[i].concat(old_data[i]);
			}
console.log(newData);
			render(newData);
		}
	});
	var t = setTimeout(update, 60*1000);
}


var round = function(num){
	return Math.round(num * 100) / 100;
}

