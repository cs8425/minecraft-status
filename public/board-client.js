doT.templateSettings = {
	evaluate:    /<%([\s\S]+?)%>/g,
	interpolate: /<%-([\s\S]+?)%>/g,
	encode:      /<%=([\s\S]+?)%>/g,
	use:         /<%#([\s\S]+?)%>/g,
	define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
	varname: 'it',
	strip: false,
	append: true,
	selfcontained: false
};
marked.setOptions({
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

var list_board = doT.template($('#tmpl-board').html());
var list_topic = doT.template($('#tmpl-topic').html());

var st = 0;
var timer = null;

var update = function(){
	clearTimeout(timer);
	if(st == 0 && (window.location.hash)){
		st = window.location.hash.replace(/^#/, '');
	}

	var url = (st != 0) ? '?get=' + st : '';
	$.ajax({
		method: "GET",
		url: "/api/board" + url,
		dataType: "json",
		error:  function( jqXHR, textStatus, errorThrown ){console.log(errorThrown);timer = setTimeout(update, 60*1000);},
		success: function(data, textStatus, jqXHR ){
console.log(data);
			if(url == ''){
				$('#board').html(list_board(data));
				$('.rowGroup').bind('click', detail);
			}else{
				$('#list').html(list_topic(data));
				$('#goback').unbind('click').bind('click', goback);
			}
			timer = setTimeout(update, 60*1000);
		}
	});
	
}
update();

var goback = function(e){
	$('#list').hide();
	$('#board').show();
	$('#topic').parent().show();

	var that = $(this);
console.log(e, that, that.attr('id'));

	st = 0;
	window.location.hash = '';
	update();
}

var detail = function(e){
	$('#list').show();
	$('#board').hide();
	$('#topic').parent().hide();

	var that = $(this);
console.log(e, that, that.attr('id'));

	st = window.location.hash = that.attr('id');
	update();
}


var post = function(){
	var r = (st != 0) ? st : null;
	var topic =  (st == 0) ? $('#topic').val() : null;
	$.ajax({
		method: "POST",
		url: "/api/board",
		dataType: "json",
		data: JSON.stringify({
			r: r,
			topic: topic,
			name: $('#name').val(),
			email: $('#email').val(),
			content: $('#content').val()
		}),
		error:  function( jqXHR, textStatus, errorThrown ){console.log(errorThrown);},
		success: function(data, textStatus, jqXHR ){
console.log(data);
			$('#content').val('');
			update();
		}
	});
}
$('#send').bind('click', post);

$('#new-post').hide();
$('#say').bind('click', function(){$('#new-post').toggle() });



