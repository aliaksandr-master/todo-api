require(["chaplin", "routes"],function(Chaplin, routes){
	'use strict';

	var Application = Chaplin.Application.extend({});

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

	return new Application({

		routes: routes,
		controllerSuffix: ''

	});

});