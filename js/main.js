"use strict";

$(document).ready(function() {
	
	$(".modal-draggable .modal-dialog").draggable({
		handle: ".modal-header"
	});
	
	
	$(".js_type").select2({
		templateResult: formatState,
		placeholder: "Select a type",
		minimumResultsForSearch: Infinity
	});
});


/**RUN PARSER**/
$('.js_btnrun').on('click',function(e){
	e.preventDefault();
	$(this).hide();
	$('.js_btnstop').show();
	console.log('dont work');
});
$('.js_btnstop').on('click',function(e){
	e.preventDefault();
	$(this).hide();
	$('.js_btnrun').show();
	console.log('dont work');
});
/**RUN PARSER**/



/**RESULT PARSE**/
$('.js_res_save').on('click',function(e){
	e.preventDefault();
	console.log('dont work');
});
$('.js_res_del').on('click',function(e){
	e.preventDefault();
	console.log('dont work');
});

/**RESULT PARSE**/





_PARSE.sites.push({'id':'1', 'name':'habrahabr.ru','url':'http://habrahabr.ru/','date_edit':'22.05.2015'});
_PARSE.sites.push({'id':'2', 'name':'mirtesen','url':'http://mirtesen.ru/#','date_edit':'22.05.2015'});


function addSiteData(data){
	_PARSE.sites.push(data);	
}

function removeSiteData(id){
	var arr = [];
	for(var i in _PARSE.sites){
		if(_PARSE.sites[i]['id'] != id) arr.push(_PARSE.sites[i]);
	}
	_PARSE.sites = arr;
}
function getSiteData(){
	return _PARSE.sites;
};

function getSite(id){
	for(var i in getSiteData()){
		if(getSiteData()[i]['id'] == id) return getSiteData()[i];
	}
	return false;
};

/**PARSE LIST**/
var ParseList = {
	list : null,
	get : function(){
		
	},
	
    controller: function() {
		//alert('fgh');
    },
    view: function() {
        return m("div", {config: ParseList.config}, m.trust(document.querySelector('#js_parse_list').innerHTML));
    },
    config: function(el, isInit, ctx) {
		/*
		var host = document.querySelector('#js_block');
		var template = document.querySelector('#js_parse_list');
		var clone = document.importNode(template.content, true);
		document.querySelector('#js-block').appendChild(clone);	
		*/	
		var initParseList = function (){
				//http://www.listjs.com/examples/add-get-remove
				var ParseOptions = {
					valueNames: ['id','name', 'url', 'date_edit' ],
					item: '<li class="">'+
									'<span class="id col_5" id="yw0_c1"><a><span class="caret"></span></a></span>'+
									'<span class="name col_5" id="yw0_c1"><a><span class="caret"></span></a></span>'+
									'<span class="url col_5" id="yw0_c2"><a><span class="caret"></span></a></span>'+
									'<span class="date_edit col_5" id="yw0_c3"><a><span class="caret"></span></a></span>'+
									'<span class="button-column col_5" id="yw0_c4">'+ 
												'<button style="margin-left: 5px;" class="js_parse_edit edit" title="Редактировать"><i class="icon-edit"></i></button>'+
												//'<button style="margin-left: 5px;" class="js_parse_xx xx" title="Генерировать"><i class="icon-file"></i></button>'+
												//'<button style="margin-left: 5px;" class="js_parse_xx xx" title="Управление запуском"><i class="icon-play"></i></button>'+
												'<button style="margin-left: 5px;" class="js_parse_res res" title="Результат выполнения"><i class="icon-folder-open"></i></button>'+
												'<button style="margin-left: 5px;" class="js_parse_del del" title="Удалить"><i class="icon-remove"></i></button>'+
									'</span>'+
							'</li>'
				};
				// Init list
				ParseList.list = new List('parser_list', ParseOptions);
				return ParseList.list;
		}
		
		
		function addSiteList(){
			var parser = getSiteData();
			ParseList.list.add(parser);
		}
		initParseList();
		addSiteList();	
			
		function initEven(event,attr){
					var el = event.target || event.srcElement;
					var button = $(el);
					var id = button.parent().parent().parent().find('.id').text();
					var name = button.parent().parent().parent().find('.name').text();
					var url = button.parent().parent().parent().find('.url').text();
					//alert(id);
					m.route("/parse/"+attr+"/"+id);
					var modal = $(this);
					modal.find('#js_scrid').val(id);
					modal.find('span.js_url').text(url);
					modal.find('input.js_url').val(url);
					modal.find('.js_parse_id, .js_parse_name').text(name);	
		}
		
		var setAction = function(action){
			var elem = document.querySelectorAll('.js_parse_'+action);
			for(var i in elem){
				if ( i=='length' || i=='item') continue;
				elem[i].onclick = function(event){
					initEven(event, action);
				}
			}
		};
		var action = ['edit','res','del'];
		for(var k in action){
			setAction(action[k]);
		}
	
    }
};



var ParseEdit = {
    controller: function() {
		
	},
    view: function() {
        return m("div", {config: ParseEdit.config}, m.trust(document.querySelector('#js_parse_edit').innerHTML));
	},
	config : function(el, isInit, ctx){
		var data = getSite(m.route.param("id"));
		$('#js_scrid').val(data.id);
		$('span.js_url').text(data.url);
		$('input.js_url').val(data.url);
		$('.js_parse_id, .js_parse_name').text(data.name);		
		/**EDIT PARSE**/
		$('#js_base_btn').change(function() {
			if($(this).is(":checked")) {
				addBaseTag(getIframeContent('html'), $('input.js_url').val());
				var html = populateIframe('html', getIframeContent('html').body.innerHTML);
				setEvenHoveredAll(html);
			}else{
				delBaseTag(getIframeContent('html'));
				var html = populateIframe('html', getIframeContent('html').body.innerHTML);
				setEvenHoveredAll(html);
			}
		});
		$('.js_loadpage_nourl').on('click',function(e){
			e.preventDefault();
			var url = document.querySelector('input.js_url').value;//_PARSE.url;
			request(url);
			return false;
		});
		
		$('.js_save_rule').on('click',function(e){
			e.preventDefault();
			rulessave();
			var id = m.route.param("id");
			m.route("/parse/res/"+id);
		});
		
		$('#js_golink').on('click',function(e){
			//e.preventDefault();
			_PARSE.golink = !_PARSE.golink;
		});
		
		$('.js_set_item').on('click', function(e){
			e.preventDefault();
			setItem();
			return false;
		});
		/**EDIT PARSE**/		
	}
};

var ParseRes = {
    controller: function() {},
    view: function() {
		return m("div", {config: ParseRes.config}, m.trust(document.querySelector('#js_parse_res').innerHTML));
	},
	config : function(el, isInit, ctx){
		tabRuleClick();
	}
};

var ParseCreate = {
    controller: function() {},
    view: function() {
		return m("div", {config: ParseCreate.config}, m.trust(document.querySelector('#js_parse_create').innerHTML));
	},
	config : function(el, isInit, ctx){
		/**SAVE PARSER**/
		$('.js_site_save').on('click',function(e){
			e.preventDefault();
			var data = {
				'id' : '3',
				'name': $('#js-name-field').val(),
				'url': $('#js-url-field').val(),
				'date_edit' : new Date().yyyymmdd()
			};	
			addSiteData(data);
			m.route("/");
			
		});
		/**SAVE PARSER**/		
	}
};

var ParseDel = {
    controller: function() {},
    view: function() {
		return m("div", {config: ParseDel.config}, m.trust(document.querySelector('#js_parse_delete').innerHTML));
	},
	config : function(el, isInit, ctx){

		/**DELETE PARSER**/
		
		$('.js_site_del').on('click',function(e){
			e.preventDefault();
			//var itemId = $('#js_scrid').val();
			removeSiteData(m.route.param("id"));
			m.route("/");
		});
		/**DELETE PARSER**/
	}
};

var ParseRun = {
    controller: function() {},
    view: function() {}

};


var Dashboard = {
    controller: function() {},
    view: function() {}
};

m.route.mode = "hash";
//m.route.mode = "search";
//go to the default route (home)
m.route(document.querySelector('#js_block'), "/", {
    "/": ParseList,
	"/parse/create" : ParseCreate,
	"/parse/edit/:id" : ParseEdit,
	"/parse/res/:id" : ParseRes,
	"/parse/del/:id" : ParseDel,
	"/parse/run/:id" : ParseRun,
    "/dashboard": Dashboard,
});
