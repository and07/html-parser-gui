"use strict";

$(document).ready(function() {
    
    $(".js_type").select2({
        templateResult: formatState,
        placeholder: "Select a type",
        minimumResultsForSearch: Infinity
    });
});

$('#js_base_btn').change( function() {
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
$('.js_loadpage_nourl').on('click', function(e){
    e.preventDefault();
    var url = document.querySelector('input.js_url').value;//_PARSE.url;
    request(url);
    return false;
});

$('.js_save_rule').on('click', function(e){
    e.preventDefault();
    Layer.hide();
    rulessave();
    Layer.show({content: document.querySelector('#js_parse_res').innerHTML });
    tabRuleClick();
});

$('#js_golink').on('click', function(e){
    //e.preventDefault();
    _PARSE.golink = !_PARSE.golink;
});

$('.js_pagination').on('click', function(e){
    //e.preventDefault();
    if($(this).hasClass( "icon-pagination" ))
        $(this).removeClass('icon-pagination').addClass('icon-pagination-check');
    else
        $(this).removeClass('icon-pagination-check').addClass('icon-pagination');
        
    _PARSE.golink = !_PARSE.golink;
    
});


$('.js_extractor').on('click', function(e){
    //e.preventDefault();
    Layer.hide();
});

$('.js_data_model').on('click', function(e){
    Layer.hide();
    Layer.show({content: document.querySelector('#js_model_data').innerHTML});
});

$('.js_data_raw').on('click', function(e){
    Layer.hide();
    Layer.show({content: document.querySelector('#js_raw_data').innerHTML  });
});


$('.js_set_item').on('click', function(e){
    e.preventDefault();
	var type = $('#itemNameParseModal select[name="type"]').val();
	var name = $('#itemNameParseModal input[name="name"]').val();
	var attr =  $('#itemNameParseModal .js_attr').val() || null;
	var parent = $('#itemNameParseModal .js_parent').val() || null;
    setItem({type:type,name:name,attr:attr,parent:parent});
    return false;
});