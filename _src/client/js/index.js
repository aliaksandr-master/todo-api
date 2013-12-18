(function(){
	'use strict';

	require.config({
		baseUrl: '/client${config:cacheKey}/js/',

		paths: {
			styles: '../styles',
			vendor: '../vendor',
			templates: '../templates',
			jquery: '../vendor/jquery/jquery',
			underscore: '../vendor/underscore/underscore',
			backbone: '../vendor/backbone/backbone',
			handlebars: '../vendor/handlebars/handlebars',
			text: '../vendor/requirejs-text/text',
			chaplin: '../vendor/chaplin/chaplin'
		},

		map:{

			"*":{
				css: 'vendor/require-css/css'
			},
		},

		shim: {
			jquery: {
				init: function(jquery){
					return jquery.noConflict(true);
				}
			},
			underscore: {
				exports: '_'
			},
			backbone: {
				deps: [
					'underscore',
					'jquery'
				],
				exports: 'Backbone'
			},
			handlebars: {
				exports: 'Handlebars'
			}
		}

	});
})();

require(['application', 'routes'],function(Application, routes){
	'use strict';

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

	var app = new Application({

		routes: routes,
		controllerSuffix: ''

	});

});