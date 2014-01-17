(function(window, $, Handlebars, _, undefined){
	$(function(){
		var JSON = {};
		var menuTpl = function(){

		};
		$.ajax({
			url: window.API_JSON,
			async: false,
			dataType: 'json',
			success:function(resp){
				JSON = resp;
			}
		});
		$.ajax({
			url: window.MY_ROOT + 'templates/colapsed-menu.hbs',
			async: false,
			success:function(resp){
				menuTpl = Handlebars.compile(resp);
			}
		});
		var $form = $("#genForm");
		var $btnMenu = $("#left-menu");
		var nameMap = {};
		var currName = null;
		var currMethod = null;
		var currLocation = (window.location.href + "").replace(/^[^\#]+\#?(.*)$/, "$1");
		var map = {};
		$.each(JSON, function(k, v){
			var name = k.replace(/\s/, '');
			nameMap[name] = k;
			var method = k.replace(/^([a-zA-Z]+).+$/, '$1');
			if(!map[method]){
				map[method] = [];
			}
			map[method].push({
				name: name,
				text: k.replace(/^([a-zA-Z]+)\s+(.+)$/, '$2'),
				link: '#' + name
			});
			if((currLocation && currLocation == name) || (!currLocation && !currName)){
				currName = name;
				currMethod = method;
			}
		});
		var _map = [];
		_.each(map, function(v, k){
			_map.push({
				index: _map.length,
				name: k,
				links: v
			});
		});

		$btnMenu
			.append(menuTpl({data: _map}));
		$("#accordion")
			.collapse();

		$btnMenu.on('click', 'li > a', function(){
			window.location.href = $(this).attr("href");
			window.location.reload();
			return false;
		});
		$btnMenu.find('.active').removeClass('active');
		$btnMenu.find('[data-method="'+currMethod+'"]').addClass('in');
		$btnMenu.find('[data-name="'+currName+'"]').parent().addClass('active');

		// BUILD FORM
		if(JSON[nameMap[currName]]){
			(function(){
				var curr = nameMap[currName];

				$("#mainHeader").html(curr);
				var data = JSON[nameMap[currName]];
				var method = curr.replace(/([a-z]+)\s+(.+)/i, '$1');
				var url = curr.replace(/([a-z]+)\s+(.+)/i, '$2');

				var counter = 1;
				url = url.replace(/\$[^\/]+/g, function($0){
					if(/id/i.test($0)){
						return counter++;
					}
					return $0;
				});
				$form.attr('action', window.API_ROOT + url + "/");
				$form.attr('method', method);

				if(data["request"]){
					var formElement = '';
					$.each(data['request'], function(k, v){
						if(!/^\$/.test(k)){
							console.log(k, v);
							var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
							var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
							if(/bool/.test(type)){
								formElement += '<div><label>'+name+' (true)<input type="radio" name="'+name+'" value="1"></label></div>';
								formElement += '<div><label>'+name+' (false)<input type="radio" name="'+name+'" value="0"></label></div>';
							}else{
								formElement += '<input type="text" name="'+name+'">';
							}
						}
					});
					$form.html(formElement);
				}
			})();
		}
	});
})(window, jQuery, Handlebars, _, undefined);