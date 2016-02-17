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


var ParseEdit = {
    controller: function() {
		
	},
    view: function() {
        return m("div", {config: ParseEdit.config}, m.trust(document.querySelector('#js_parse_edit').innerHTML));
	},
	config : function(el, isInit, ctx){
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
			m.route("/res/");
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


m.route.mode = "hash";

m.route(document.querySelector('#js_block'), "/", {
    "/": ParseEdit,
	"/res/" : ParseRes,
});
