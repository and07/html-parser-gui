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
			rulessave();
            Layer.show({content: document.querySelector('#js_parse_res').innerHTML });
            tabRuleClick();
		});
		
		$('#js_golink').on('click', function(e){
			//e.preventDefault();
			_PARSE.golink = !_PARSE.golink;
		});
        
        $('.js_extractor').on('click', function(e){
			//e.preventDefault();
			Layer.hide();
		});
		
		$('.js_set_item').on('click', function(e){
			e.preventDefault();
			setItem();
			return false;
		});