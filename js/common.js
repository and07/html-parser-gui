"use strict";

/***RULE***/
var _PARSE = {
		sites : [],
		url : null,
		html : null,
		name : null,
		date_edit : null,
		rule_name : null,
		rule_type : null,
		rule_path : null,
		page:null,
        pages: {},
		doc : null,
		rule : [],
		seltype : [
			'',
			'link',
			'text',
			'html',
			'img',
			'table',
		],
		golink : null,
        path_type : 0, // 0 css selector 1 xpath
		clear_name : null,
};

var getElementByXpathAll = function(xpathToExecute){
  var result = [];
  var nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
  for ( var i=0 ; i < nodesSnapshot.snapshotLength; i++ ){
    result.push( nodesSnapshot.snapshotItem(i) );
  }
  return result;
};


function getElementByXpath (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

//console.log( getElementByXpath("//html[1]/body[1]/div[1]").innerHTML );

function addScript(el,url,param){
	param = param || "";
	var script = el.createElement("script");
	script.src = url+'/'+param;
	script.async = true;
	el.getElementsByTagName("head")[0].appendChild(script);
};

var jsonp_set_html = function(data) {
	_PARSE.golink = false;
	console.log(data)
    setItem({type:'link', name:'pagination', attr:null, parent:null});
	var html = populateIframe('html', data.res);
	_PARSE.page = data.url;
    _PARSE.pages[data.url] = data.res;
	setEvenHoveredAll(html);
	//removeClass(document.querySelector('#js_golink'),'active');
	document.querySelector('#js_golink').checked = false;
	Loading.close();
    return;
};
	
function request(url, callback) {
	Loading.show();
	callback = callback||null;
	if(callback === null){
		callback = function(res) {
			_PARSE.golink = false;
			var html = populateIframe('html', res.responseText);
			setEvenHoveredAll(html);
			document.querySelector('#js_golink').checked = false;
			Loading.close();
		};
	}
	url = encodeURIComponent(url);
	var type_request = document.querySelector('input[name="request"]:checked').value;
	if(type_request == 'curl'){
		addScript(document,'https://url2data.herokuapp.com','data?url='+url+'&jsonp=jsonp_set_html');
	}else{
		addScript(document,'https://url2data.herokuapp.com','content?url='+url+'&jsonp=jsonp_set_html&time=5000');
	}
};


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var _hh = this.getHours().toString(); 
   var _mm = this.getMinutes().toString();  
   var _ss = this.getSeconds().toString();  
   return yyyy + '-' + ( mm[1]?mm:"0"+ mm[0] ) +'-' + (dd[1]?dd:"0"+dd[0]) + ' '+ _hh+':'+_mm+':'+_ss; // padding
};
$.fn.getStyleObject = function(){
    var dom = this.get(0);
    var style;
    var returns = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
		if(style && style.length){
			for(var i = 0, l = style.length; i < l; i++){
				var prop = style[i];
				var camel = prop.replace(/\-([a-z])/, camelize);
				var val = style.getPropertyValue(prop);
				returns[camel] = val;
			}
		}
        return returns;
    }
    if(dom.currentStyle){
        style = dom.currentStyle;
        for(var prop in style){
            returns[prop] = style[prop];
        }
        return returns;
    }
    if(style = dom.style){
        for(var prop in style){
            if(typeof style[prop] != 'function'){
                returns[prop] = style[prop];
            }
        }
        return returns;
    }
    return returns;
};
	
function delBaseTag(el){
	var head = el.getElementsByTagName("head")[0]
	var oldBase = el.getElementsByTagName("base")[0];
	if(oldBase){
		head.removeChild(oldBase);
	}
}

function addBaseTag(el,url){
	delBaseTag(el);
	var newBase = el.createElement("base");
	newBase.setAttribute("href", url);
	var head = el.getElementsByTagName("head")[0];
	var theFirstChild = head.firstChild;
	head.insertBefore(newBase, theFirstChild);	
}
function getIframeContent(id) { 

    var iframe = document.getElementById(id); 

    var doc; 

    if(iframe.contentDocument) { 
        doc = iframe.contentDocument; 
    } else {
        doc = iframe.contentWindow.document; 
    }
    return doc;
} 

function populateIframe(id,text) {
	var doc = getIframeContent(id);
	doc.body.innerHTML = text;
	doc.src = 'javascript:window.contents';	
	return doc;
}


/*****
 * formatter
 */
function escapeStr(str)
{
	if (typeof str == 'string')
		return str.replace(/([^\\])'/g, "$1\\'");
	return str;
}

String.space = function (len) {
	var t = [], i;
	for (i = 0; i < len; i++) {
		t.push(' ');
	}
	return t.join('');
};
var formatJSON = function (text) {
				text = text.replace(/\n/g, ' ').replace(/\r/g, ' ');
				var t = [];
				var tab = 0;
				var inString = false;
				for (var i = 0, len = text.length; i < len; i++) {
					var c = text.charAt(i);
					if (inString && c === inString) {
						// TODO: \\"
						if (text.charAt(i - 1) !== '\\') {
							inString = false;
						}
					} else if (!inString && (c === '"' || c === "'")) {
						inString = c;
					} else if (!inString && (c === ' ' || c === "\t")) {
						c = '';
					} else if (!inString && c === ':') {
						c += ' ';
					} else if (!inString && c === ',') {
						c += "\n" + String.space(tab * 2);
					} else if (!inString && (c === '[' || c === '{')) {
						tab++;
						c += "\n" + String.space(tab * 2);
					} else if (!inString && (c === ']' || c === '}')) {
						tab--;
						c = "\n" + String.space(tab * 2) + c;
					}
					t.push(c);
				}
				return t.join('');
			};

function tabRuleClick()
{
	var data = formatJSON(JSON.stringify(getRule()));
	$('.js_rule_res').val(data);
}

/***
var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
 
myURL.file;     // = 'index.html'
myURL.hash;     // = 'top'
myURL.host;     // = 'abc.com'
myURL.query;    // = '?id=255&m=hello'
myURL.params;   // = Object = { id: 255, m: hello }
myURL.path;     // = '/dir/index.html'
myURL.segments; // = Array = ['dir', 'index.html']
myURL.port;     // = '8080'
myURL.protocol; // = 'http'
myURL.source;   // = 'http://abc.com:8080/dir/index.html?id=255&m=hello#top'

****/

function parseURL(url) {
    //url = decodeURIComponent( url );
    url = decodeURI( url );
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/'),

    };
};

function getNestedChildren(arr, parent) {
    var out = [];
    for(var i in arr) {
        if(arr[i].parent == parent) {
            var children = getNestedChildren(arr, arr[i].name);
            if(children.length) {
                arr[i].children = children;
            }
            out.push(arr[i]);
        }
    }
    return out;
};

function deepCopy(o) {
    var copy = o,k;
 
    if (o && typeof o === 'object') {
        copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
        for (k in o) {
            copy[k] = deepCopy(o[k]);
        }
    }
    return copy;
}

function getRule(){
    var url = $('input.js_url').val();
    var name =  $('.js_parse_name').text();
    var host = parseURL(url);
    var domen = host.protocol + '://' + host.host;
    var type = _PARSE.type;
    var path_type = _PARSE.path_type;
	var all = document.querySelector('#js_all').checked;
    var limit = document.querySelector('#js_limit').value || 1;
	var rule = deepCopy(_PARSE.rule.slice());
	return {'url':url, 'all':all, 'rule':getNestedChildren(rule, null), 'host':host['host'], 'name':name, 'domen':domen, 'limit':limit, 'path_type':path_type};
};

function rows2cols(a) {
  var r = [];
  var t;

  for (var i=0, iLen=a.length; i<iLen; i++) {
    t = a[i];

    for (var j=0, jLen=t.length; j<jLen; j++) {
      if (!r[j]) {
        r[j] = [];
      }
      r[j][i] = t[j];
    }
  }
  return r;
};

function formatData (data){
  var arr = [];
  var tmp = [];
  var new_data = [];
  for(var i in data){
    tmp.push(i);
    new_data.push(data[i]);
  }
  arr.push(tmp);

  var res = rows2cols(new_data);
  for(var i in res){
    arr.push(res[i]);
  }
  return arr;
};

function data2table(data){
  var out = '';
  out += '<table class="table table-bordered">';
  for(var i  in data){
    out += '<tr>';
    for(var j in data[i]){
      out += '<td>'+data[i][j]+'</td>';
    }
    out += '</tr>';
  }
  out += '</table>';
  return out;
};

function getContentElement(rule){
   var obj = {};
   var doc = getIframeContent('html');
   for(var i in rule){
       var r = rule[i];
       if(r['children'])
            return getContentElement(r['children']);
       var path = r['path'];
       var name = r['name'];
       obj[name] = [];
       var elements = getAllElement(doc, path);
       for(var k in elements){     
            var el = elements[k];
            if(typeof el  == 'object')
                obj[name].push(el.innerHTML);
       }
   }
   return obj;
};

function fullPath(el){
  var names = [];
  while (el.parentNode){
    if (el.id){
      names.unshift('#'+el.id);
      break;
    }else{
      if (el==el.ownerDocument.documentElement) names.unshift(el.tagName);
      else{
        for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
        names.unshift(el.tagName+":nth-child("+c+")");
      }
      el=el.parentNode;
    }
  }
  return names.join(" > ");
};

/**
 * USE
 * console.log($(fullPathSimple(document.querySelector('.post_title'))));
 */
function fullPathSimple(el){
  var names = [];
  while (el.parentNode){
      if(el.hasAttribute('class')){
          names.unshift(el.tagName.toLowerCase() +'.'+ el.getAttribute('class').replace(/ /g, "."));
      }else if(el.hasAttribute('id')){
          names.unshift(el.tagName.toLowerCase() +'#'+ el.getAttribute('id'));
      }else{
          names.unshift(el.tagName.toLowerCase());
      }
      el=el.parentNode;
  }
  return names.join(">");
};

function createXPathFromElement(elm) { 
    //var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    {
    	if (elm.nodeName.toLowerCase() == 'html' || elm.nodeName.toLowerCase() == 'body')
    	{
    		segs.unshift(elm.nodeName.toLowerCase());
    	}
    	else if (elm.hasAttribute('id')) { 
            segs.unshift(elm.nodeName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
        } else if (elm.hasAttribute('class')) {
        	var classname = elm.getAttribute('class');
        	var childs = elm.parentNode.childNodes;
        	var pos = 0;
        	var isPosCount = true;
        	var total = 0;
        	for (var i=0; i<childs.length; i++)
        	{
        		if (childs[i].nodeType == 1 && childs[i].hasAttribute('class'))
        			if (childs[i].nodeName==elm.nodeName && childs[i].getAttribute('class')==classname)
        			{
        				if (isPosCount) pos++;
        				if (childs[i] == elm) isPosCount = false;
        				total++;
        			}	
        	}
        	var str = elm.nodeName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]';
        	if (total > 1)
        		str += '[' + pos + ']';
        	segs.unshift(str); 
        } else { 
            for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.nodeName == elm.nodeName)  i++; 
            }; 
            segs.unshift(elm.nodeName.toLowerCase() + '[' + i + ']'); 
        }; 
    };
    
    if (/*PagesList.get() && PagesList.get().type == 'html' &&*/ segs[0] == 'html' && segs[1] == 'body')
    	segs.splice(0, 3);    	
    
    return segs.length ? '//' + segs.join('/') : null; 
};

function getFullPatElement(el){
    if(_PARSE.path_type)
         return createXPathFromElement(el);
    return fullPathSimple(el);
}

function getAllElement(doc, path){
	if (_PARSE.path_type){
		return evaluateXPath(path, doc);
	}
   return doc.querySelectorAll(path);
}

var isIe = /MSIE [56789]/.test(navigator.userAgent) && (navigator.platform == "Win32");
function evaluateXPath(xpath, doc, context) {
	if (isIe)
	{
		//в IE в xpath в div[1] нумерация начинается с 0
		var p = xpath.split('/');
		for (var i=0; i<p.length; i++)
		{
			if (p[i] != '')
			{
				var result = p[i].match(/\[(\d+)\]/i);
				if (result != null)
				{
					var num = parseInt(result[1])-1;
					p[i] = p[i].replace(/\[\d+\]/i, '['+num+']');
				}
			}
		}
		xpath = p.join('/'); 
	}
	
	var nodes = [];
	if (context == undefined) context = doc;
	var result = doc.evaluate(xpath, context, null, 0, null);
    var node = result.iterateNext();
    while (node) {
    	nodes.push(node);
    	node = result.iterateNext();
    }
    return nodes;
}

function makeTree(){
	$('.js_items').html('');
	var editItem = function (){
		var el = document.querySelector($(this).attr('data-id'));
		$('.js_set_path').attr('data-id', $(this).attr('data-id'));
		htmltree(el);
	}
	var delItem = function (){
		
		var id = $($(this).attr('data-id')).parent().attr('data-vtree-id');
		var name = document.querySelector($(this).attr('data-id')).querySelector('.name').value;
		var rule = [];
		for(var obj of _PARSE.rule){
			if(obj.name == name) continue;
			rule.push(obj);
		}
		_PARSE.rule = rule;
		_PARSE.rule_name = null;
		_PARSE.rule_type = null;
		_PARSE.rule_path = null;
		if(tree){
			tree.remove(id);
		}
		
	}	
	function createItem(data) {
		scnt++;
		var id = 'div#tree_item_'+scnt+'';
		var _path = 'path';
		var _name = 'name';
		var _type = 'type';
		var _attr = 'attr';
		return v(id, {}, [ 
				v('div.row', {}, [
					v( 'div.col-xs-2',{},[
						v('input.form-control.type.selattr',{value:data.type ,name:_type,'disabled':"disabled"}),
					]),
					v( 'div.col-xs-2',{},[
						v('input.form-control.name',{value:data.name ,type:'text',placeholder:'Name',name:_name,'disabled':"disabled"}),
					]),
					v( 'div.col-xs-4',{},[				
						v('input.form-control.path',{value:data.path ,type:'text',placeholder:'path',name:_path,'disabled':"disabled"}),
					]),
					v( 'div.col-xs-4',{},[				
						v('input.form-control.attr',{type:'hidden',placeholder:'Attr',name:_attr,'disabled':"disabled"}),
					]),					
					v( 'div.col-xs-1',{},[		
						v("button.btn.btn-default", { onclick: editItem, 'data-id':id}, "EditItem"),
					]),
					v( 'div.col-xs-1',{},[	
						v('button.btn.del',{onclick: delItem, 'data-id':id},'X'),
					]),
				]),
		]);
	};

	var scnt = 1;
	$('.js_items').attr('id','js_items_'+scnt);
	var tree = new VanillaTree( '#js_items_'+scnt, {});
	var obj = _PARSE.rule;
	for(var i in obj){ 
		var pid = obj[i].parent || null; 
		tree.add({
			el: createItem(obj[i]),
			id: obj[i].name,
			label:'aa'+i,
			parent :pid,
			opened: true
		});
	}

}

function setItem(param)
{
	if (param.name != '' && param.name.search(/^[A-Za-z][A-Za-z0-9_]*$/) != -1) 
	{
		//$('#itemNameParseModal').fadeOut('slow');
        param['page'] = _PARSE.page;
        if(_PARSE.rule_path){
           
            $('#itemNameParseModal').modal('hide');
            param['path'] = _PARSE.rule_path;
            _PARSE.rule.push(param);
            fillSel('.js_parent', [{'text' : param.name , 'value' : param.name}]);
        }
	}else{
        alert('Error: name');
    }
    return;
}

function clickElem(e){
    e = e || event;
    e.preventDefault();
    e.stopPropagation();
    var _target = e.target || e.srcElement;
    
    if(_PARSE && _PARSE.golink){
        _PARSE.rule_path = getFullPatElement(_target);
        var url = $(_target).attr('href');
        if(!url) url = $(_target).parent().attr('href');
        request(url);
        //return;
    }else{
        _PARSE.rule_path = getFullPatElement(_target);
        //document.querySelector('#js_limit').value = document.evaluate(_PARSE.rule_path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength
        //attr
        $('.js_attr').html('<option value=""></option>');
        for (var i = 0, atts = _target.attributes, n = atts.length, arr = []; i < n; i++){
            fillSel('.js_attr', [{ 'text' : atts[i].nodeName , 'value' : atts[i].nodeName }]);
        }
        var doc = getIframeContent('html');
        selectBorder(getAllElement(doc, _PARSE.rule_path), true);
    }
    
    return false;
}
                    
function addEventListener(element, name, observer, capture) {
    capture = capture|| false;
	if (typeof element == 'string') {
		var doc = getIframeContent('html');
        element = doc.querySelector(element);
    }
	if(element){
		if (element.addEventListener) {
			element.addEventListener(name, observer, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + name, observer);
		}
	}
};
function setEvenHoveredAll(html){
   var hovered = document.getElementById('hovered-element-info');
   var allNodes = html.getElementsByTagName('*');
   var tag = ['meta','title','link','script','body'];
   var tagNode = [];
   for(var i=0; i< allNodes.length; i++ ){
		if(allNodes[i].tagName.toLowerCase() in tag){
			continue;
		}else{
			if(allNodes[i].tagName.toLowerCase() in tagNode){
				continue;
			}else{
				tagNode.push(allNodes[i].tagName.toLowerCase());
				addEventListener(allNodes[i], 'mouseover', function(e){
					e = e || event;
                    e.preventDefault();
					e.stopPropagation();
					var target = e.target || e.srcElement;
					//target.style.border = "1px solid #000";
					target.style.background="#d3e2f0";//"#f2f2f2";
					// console.log( getFullPatElement(target));
				   
					hovered.innerHTML = getFullPatElement(target);
					//_EVENT.add(this,'click',setXpath);
                    addEventListener(target, 'click', clickElem);
				});                            
				addEventListener(allNodes[i], 'mouseout', function(e){
					e = e || event;
                    e.preventDefault();
					e.stopPropagation();
					var target = e.target || e.srcElement;     
                    target.removeEventListener('click', clickElem, false);                       
					//this.style.border = "none";
					this.style.background="";
				});
			}                  
		} 
	}
}

function selectBorder(elems, dialog)
{
	if (dialog == undefined || dialog == true)
	{
		$('#itemNameParseModal').modal('show');
	}	
    for(var i in elems){
        var element = elems[i];
        $(element).css('border', '3px dashed red');       
    }
}

function hasClass(ele,cls) {
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
    	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


/**
 * layer
 */
var Layer = (function(){
    
    var config_def  = {
        'css': {
            'top' :  $('#header').height()-5,
            'opacity' : 0.8,
            'background' : '#000',
        },
        'content' : null
    };
 
    
	function showLayer(config)
	{
        config = extend({}, config_def, config);
        var $layer = $('<div id="layer"></div>');
        for(var key in config.css){
            $layer.css(key, config.css[key]);
        }
        if(config.content){
            $layer.html(config.content);
        }
        $layer.width($(window).width());
        $layer.height($(document).height());
        $layer.height($(document).height());
        $layer.appendTo('nav');

	};

	function hideLayer()
	{
		$('#layer').remove();
	};
	
	
	return {
		show : showLayer,
		hide : hideLayer
	}
})();


/*******Loading*******/
var Loading = (function(){
	var LoadingProcessCount = 0;
	function showLoadingProcess()
	{
		if (LoadingProcessCount <= 0)
		{
			var $layer = $('<div id="layer1" class="toplayer"></div>');
			$layer.css('top', $('#header').height()-5);
			$layer.width($(window).width());
			$layer.height($(document).height());
            $layer.css('opacity', 0.5);
            $layer.css('background', '#000');
			$layer.appendTo('body');
		
			$('#loader').show();
			var $win = $('#loader');
			$win.css('left', ($(window).width()-$win[0].offsetWidth)/2);
			$win.css('top', ($(window).height()-$win[0].offsetHeight-100)/2);
			LoadingProcessCount = 0;
		}
		LoadingProcessCount++;
	};

	function closeLoadingProcess()
	{
		LoadingProcessCount--;
		if (LoadingProcessCount <= 0)
		{
			$('#loader').hide();
			$('#layer1').remove();
			LoadingProcessCount = 0;
		}
	};
	
	
	return {
		show : showLoadingProcess,
		close : closeLoadingProcess
	}

})();

/*******Loading********/

/*******************Virtual DOM***********************/
/**USE
    function virtualLink(uri, text, isSelected) {
        return virtualH('li', [
            virtualH('a', {
                className: isSelected ? 'selected' : '',
                href: uri
            }, text)
        ]);
    }
    
    function domLink(uri, text, isSelected) {
        return domH('li', [
            domH('a', {
                className: isSelected ? 'selected' : '',
                href: uri
            }, text)
        ]);
    }


console.log(v('div#fghfgh.dfg', {}, [m('a.dfg',{},[m('.rr',{},[m('span',{},'ddddddd')])])]));
console.log(virtualLink('ffg', 'test', true));
console.log(domLink('fghfgh', 'test', true));
*/

function domH(tagName, props, children) {
	if (Array.isArray(props) || typeof props === 'string') {
		children = props;
		props = {};
	}
	children = children || [];
	props = props || {};
	if (typeof children === 'string') {
		children = [children];
	}

	var node = document.createElement(tagName);
	Object.keys(props).forEach(function setProp(propName) {
		//
		if (typeof props[propName] === 'string' && propName != 'className') {
			 node.setAttribute(propName, props[propName]);
		}else{
			node[propName] = props[propName];
		}

	});

	children.forEach(function addNode(n) {
		if (typeof n === 'string') {
			node.appendChild(document.createTextNode(n));
		} else {
			node.appendChild(n);
		}
	});
	return node;
}
function v() {
var type = {}.toString
var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/
var voidElements = /AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TR??ACK|WBR/        
	var args = arguments
	var hasAttrs = args[1] != null && type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
	var attrs = hasAttrs ? args[1] : {}
	var classAttrName = "class" in attrs ? "class" : "className"
	var cell = {tag: "div", attrs: {}}
	var match, classes = []
	while (match = parser.exec(args[0])) {
		if (match[1] == "") cell.tag = match[2]
		else if (match[1] == "#") cell.attrs.id = match[2]
		else if (match[1] == ".") classes.push(match[2])
		else if (match[3][0] == "[") {
			var pair = attrParser.exec(match[3])
			cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
		}
	}
	if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ")

	cell.children = hasAttrs ? args[2] : args[1]

	for (var attrName in attrs) {
		if (attrName == classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName]
		else cell.attrs[attrName] = attrs[attrName]
	}
	
	return domH(cell.tag,cell.attrs,cell.children)    
}
/***********************Virtual DOM*************************/
function fillSel(obj_name, data)
{
	//console.log(data);
	var _obj = document.querySelector(obj_name);
	for(var i=0; i < data.length; i++){
		var NewOpt=document.createElement('OPTION');
		var dataOpt = data[i];
		for(var key in dataOpt){
			if(key === 'text' ){
				 var text = document.createTextNode(dataOpt[key]);
				 NewOpt.appendChild(text);
			}else{
				NewOpt.setAttribute(key, dataOpt[key]);
			}
		}
		 _obj.appendChild(NewOpt);
	}
}
var formatState = function(state) {
		var icon = {
			'text' : '<i class="icon-align-left"></i>',
			'link' : '<i class="icon-font"></i>',
			'img' : '<i class="icon-picture"></i>',
			'html' : '<i class="icon-chevron-left"></i><i class="icon-chevron-right"></i>',
			'attr' : '',
		};
		if (!state.id) { return state.text; }
		var $state = $(
		'<span id="sel'+state.element.value.toLowerCase()+'">' + icon[state.element.value.toLowerCase()] + ' ' + state.text + '</span>'
		);
		return $state;
};


/***TreeComponentClass***/
function TreeComponentClass(div, data) {
	this.div = div;
	this.active = null;
	this.activeInd = [];
	this.data = data;
	this.srcopened = 'images/icon-opened.gif';
	this.srcclosed = 'images/icon-closed.gif';
	this.srcempty = 'images/icon-empty.gif';
	this.isclosed = true;
	
	var tree = this;
	
	tree.onactive = function(tree, el) {};
	tree.onpreactive = function(tree, el) {};

	$(div).on('click', 'img', function(e) {
   		var $ul = $(this).parent().children('ul');
   		if ($ul.length > 0)
   		{
   			if (this.src.search(tree.srcopened) != -1)
   	    		this.src = tree.srcclosed;
   	    	else
   	    		this.src = tree.srcopened;
   			$ul.slideToggle();
   		}
    });
    
    $(div).on('click', 'span', function(e) {
    	tree.onpreactive(tree, this);
    	if (tree.active)
    		$(tree.active).removeClass('selected');
    	tree.active = this;
    	$(this).addClass('selected');
    	tree.onactive(tree, this);
    });
    
    tree.update();
}

TreeComponentClass.prototype = {
	update: function(data, activeInd)
	{
		if (data == undefined)
			data = this.data;
		else
			this.data = data;
		
		if (activeInd != undefined)
			this.activeInd = activeInd;
		
		if (!data) return;
		
		var ul = document.createElement('ul');		
		for (var i=0; i<data.length; i++)
			this.createnode(data[i], ul, i, 0);
		
		$(this.div).empty().append(ul);
		

		if (this.activeInd.length > 0)
		{
			var li = $(this.div).children('ul').children('li')[this.activeInd[0]];
			
			for (var i=1; i<this.activeInd.length; i++)
			{
				$(li).children('img').prop('src', this.srcopened); 
				$(li).children('ul').show();
				var index = this.activeInd[i];
				li = $(li).children('ul').children('li')[index];
			}
			var $span = $(li).children('span');
			$span.addClass('selected');
			this.active = $span[0];
		}
		else
			this.active = null;
	},
	createnode: function(nodedata, parent, nodeindex, deep) {
		var li = document.createElement('li');
		
		var img = document.createElement('img');
		img.className = 'plus';
		img.src = this.srcempty;
		$(li).append(img);
		
		var span = document.createElement('span');
		/*if (nodeindex == this.activeInd[deep] && deep == this.activeInd.length-1)
		{
			span.className = 'selected';
			this.active = span;
		}*/
		$(span).text(nodedata.text);
		$(span).attr('index', nodeindex);
		$(li).append(span);
		
		if (nodedata.children.length > 0)
		{
			img.src = (this.isclosed /*&& nodeindex != this.activeInd[deep]*/) ? this.srcclosed : this.srcopened;
			var ul = document.createElement('ul');		
			for (var i=0; i<nodedata.children.length; i++)
			{
				this.createnode(nodedata.children[i], ul, i, deep+1);
			}
			$(li).append(ul);
			if (this.isclosed /*&& nodeindex != this.activeInd[deep]*/)
				$(ul).hide();
		}
		
		$(parent).append(li);
	},
	getActiveByInd: function(ind)
	{
		var node = this.data[ind[0]];
		for (var i=1; i<ind.length; i++)
			node = node.children[ind[i]];
		return node;
	},
	setActiveInd: function(activeInd)
	{
		this.activeInd = activeInd;
		var node = this.getActiveByInd(activeInd);
		if (node)
		{
			if (tree.active)
				$(tree.active).removeClass('selected');
			tree.active = node;
			$(node).addClass('selected');
		}
	},
	getActiveInd: function()
	{
		var ind = [];
		if (this.active)
		{
			var $node = $(this.active).parent();
			do {
				ind.splice(0, 0, $node.children('span').attr('index'));
				$node = $node.parent().parent();
			} while ($node.attr('id') != $(this.div).attr('id'));
		}
		return ind;
	}
};

/***TreeComponentClass***/
/*****************************OBJ***********************************/
    var LoadTree = new TreeComponentClass(document.getElementById('loadtree-content'), null);
    LoadTree.onactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var lp = PagesList.array2[activeInd[0]];
    	for (var i=1; i<activeInd.length; i++)
    	{
    		var name = lp.links.array2[activeInd[i]];
    		if (typeof name == 'string')
    			lp = lp.links.array[name];
    		else
    			lp = name;
    	}
    	if (PagesList.get() != lp)
    	{
    		PagesList.addObj(lp);
    		loadpage(false, lp.url, lp.type, lp.params, lp.encoding, lp.index);
    	}
    };
    
    var HtmlTree = new TreeComponentClass(document.getElementById('htmltree-content'), null);
	console.log(HtmlTree);
    HtmlTree.onactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var obj = tree.getActiveByInd(activeInd);
    	if (obj)
    	{
    		$(obj.node).data('oldstyle3', $(obj.node).getStyleObject());
    		$(obj.node).data('selected2', 1);
    		$(obj.node).css('border', '3px dashed blue');
    		var path = getFullPatElement(obj.node);
    		//$('#htmltree input[name="path"]').val(path);
    		$('.js_htmltree textarea[name="path"]').val(path);
    	}
    };
    HtmlTree.onpreactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var obj = tree.getActiveByInd(activeInd);
    	if (obj && $(obj.node).data('selected2') == 1)
    	{
    		$(obj.node).css($(obj.node).data('oldstyle3'));
    		$(obj.node).data('selected2', 0);
    	}
    };
	
	
/*****************************OBJ***********************************/

function rdb2flat(rdbarray, ret)
{
	for (var name in rdbarray)
		if (rdbarray[name] instanceof Object)
		{
			ret[name] = rdbarray[name];
			rdb2flat(rdbarray[name], ret);
		}
}
function rdb2text(rdbarray)
{
	var str = '<ul>';
	for (var name in rdbarray)
	{
		if (rdbarray[name] instanceof Object)
		{
			str += '<li style="padding-top: 5px;"><p><strong>'+name+'</strong></p>';
			str += rdb2text(rdbarray[name]);
		}
		else
			str += '<li><p>'+name+'</p>';
					
		str += '</li>';
	}
	str += '</ul>';
	return str;
}

function collectHtmlTree(node)
{
	var text = '';
	if (node.nodeType == 1)
	{
		var attrs = '';
		for (var i=0; i<node.attributes.length; i++)
		{
			if (node.attributes[i].name != 'style')
				attrs += ' '+node.attributes[i].name+'="'+node.attributes[i].value+'"';
		}
		text = '<'+node.nodeName.toLowerCase()+attrs+'>';
	}
	else if (node.nodeType == 3)
	{
		text = trim(node.nodeValue);
		if (text == '')
			return null;
	}
	
	var obj = {text: text, children: [], node: node};
	for (i=0; i<node.childNodes.length; i++)
	{
		var n = node.childNodes[i];
		if (n.nodeType == 1 || n.nodeType == 3)
		{
			var child = collectHtmlTree(n);
			if (child)
				obj.children.push(child);
		}
	}
	return obj;
}
function loadXMLString(txt) 
{
	if (window.DOMParser)
	  {
	  var parser=new DOMParser();
	  var xmlDoc=parser.parseFromString(txt,"text/xml");
	  }
	else // code for IE
	  {
	  var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async=false;
	  xmlDoc.loadXML(txt); 
	  }
	return xmlDoc;
}

function getPropItem(name){
	for (var el of _PARSE.rule){
		if(el.name == name)return el;
	}
}

function setPathItem(name,val){
	var el = getPropItem(name);
	el['path'] = val;
}


function css2xpath(selector){
    return XPathParser.parse(selector);
}

function htmltree(elem)
{
	
	$('#htmlTreeParseModal').modal('show');
	var $win = $('.js_htmltree');
	var name = elem.querySelector('.name').value;
	var path = elem.querySelector('.path').value;

	_PARSE.rule_name = elem.querySelector('.name').value;
	_PARSE.rule_type = elem.querySelector('.type').value;
	_PARSE.rule_path = elem.querySelector('.path').value;
	
	//var node = PagesList.get().rules.getNodesByName(name)[0];
	var type = 1;//parseInt(getRadioVal('type'));
	if(type === 1){
		populateIframe('html_1',_PARSE.pages[getPropItem(name).page]);
		var doc = document.getElementById('html_1').contentWindow.document;
	}else if(type === 2){
		var content = _PARSE.html ;
		var doc =  loadXMLString(content);
	}
	_PARSE.doc = doc;
	
	var node = evaluateXPath(css2xpath(path), doc)[0];

	$win.find('textarea[name="path"]').val(path);
	$win.find('input[name="path"]').val(path);
	$win.find('input[name="name"]').val(name);
	$win.find('#rulename').html('<b>'+name+'</b>');

	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$win.find('.popup-btns').css('top', $win[0].offsetHeight-40);

	var ind = [0];
	
	if (node)
	{
		var node2 = node;
		do {
			var parent = node2.parentNode;
			var index = 0;
			for (var i=0; i<parent.childNodes.length; i++)
			{
				var child = parent.childNodes[i];
				if (child == node2)
					break;
				if (child.nodeType == 1 || (child.nodeType == 3 && trim(child.nodeValue) != ''))
					index++;
			}
			ind.splice(0, 0, index);
			node2 = parent;
		} while (node2 != doc);
	}

	var data = [];
	var root;
	if (/*PagesList.get() && PagesList.get().type == 'html'*/ false)
	{
		root = doc.body;
		ind.splice(0, 1);
		ind[0] = 0;
	}
	else
		root = doc.documentElement;
	
	data.push(collectHtmlTree(root));
	
	HtmlTree.isclosed = true;
	HtmlTree.update(data, ind);
	
}

function trim(str)
{
    return str.replace(/^\s+|\s+$/g,"");
}

function setHtmlTree(obj)
{
	var $win = $('.js_htmltree');
	var name = $win.find('input[name="name"]').val();
	var _path = _PARSE.rule_path;
	var newpath = $win.find('textarea[name="path"]').val();
	
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	
	if (_path != newpath && newpath != '')
	{
		_PARSE.rule_path = newpath;
		var el = document.querySelector($(obj).attr('data-id'));
		
		el.querySelector('.path').value = newpath;
		setPathItem(name,newpath);
	}	
	
	$('#htmlTreeParseModal').modal('hide');
}

function cancelHtmlTree()
{
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	$('#htmlTreeParseModal').modal('hide');
}
