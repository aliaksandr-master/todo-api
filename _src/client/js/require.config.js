(function(){
	"use strict";

	require.config({
		baseUrl: '/client${config:cacheKey}/js/',

		paths: {

			bootstrap: '../vendor/bootstrap/custom/js/bootstrap.min',
			styles: '../styles',
			vendor: '../vendor',
			templates: '../templates',
			jquery: '../vendor/jquery/jquery',
			jqueryui: '../vendor/jqueryui/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom',
			underscore: '../vendor/underscore/underscore',
			backbone: '../vendor/backbone/backbone',
			handlebars: '../vendor/handlebars/handlebars',
			text: '../vendor/requirejs-text/text',
			chaplin: '../vendor/chaplin/chaplin',

			"jquery/swipe": '../vendor/jquery.event.swipe/jquery.event.swipe',
			"jquery/move":  '../vendor/jquery.event.move/jquery.event.move'

		},

		map:{

			"*":{
				"backbone/localStorage": 'vendor/backbone.localStorage/backbone.localStorage',
				css: 'vendor/require-css/css'
			}
		},

		shim: {
			jquery: {
				exports: "jQuery"
			},
			underscore: {
				exports: '_'
			},
			"jquery/swipe": {
				deps: ["jquery/move"]
			},
			backbone: {
				deps: [
					'underscore',
					'jquery'
				],
				exports: 'Backbone'
			},
			handlebars: {
				deps: [
					"bootstrap"
				],
				exports: 'Handlebars'
			}
		}

	});
})();