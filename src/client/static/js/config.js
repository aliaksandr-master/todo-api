'use strict';

require.config({

	enforceDefine: false,

	baseUrl: '/client/static-${config:buildTimestamp}/js/',

	paths: {

		'styles': '../styles',
		'vendor': '../vendor',
		'templates': '../templates',

		'jquery': '../vendor/jquery/jquery',
		'underscore': '../vendor/underscore/underscore',
		'bootstrap': '../vendor/bootstrap/custom/js/bootstrap.min',
		'backbone': '../vendor/backbone/backbone',
		'backbone.dualStorage': '../vendor/backbone.dualstorage/backbone.dualstorage.amd',
		'backbone.stickit': '../vendor/backbone.stickit/backbone.stickit',
		'handlebars': '../vendor/handlebars/handlebars',
		'chaplin': '../vendor/chaplin/chaplin',

		'jquery-ui': '../vendor/jquery-ui-amd',

		'jquery.swipe': '../vendor/jquery.event.swipe/jquery.event.swipe',
		'jquery.move':  '../vendor/jquery.event.move/jquery.event.move',

		'jquery-ui-touch-punch': '../vendor/jquery-ui-touch-punch-amd/jquery.ui.touch-punch',

		'backbone.shim': 'shim/backbone.shim'
	},

	map:{

		'*':{
			'text': 'vendor/requirejs-text/text',
			'css':  'vendor/require-css/css'
		}
	},

	shim: {
		jquery: {
			init: function(){
//				var _rq = window.require;
//				var _df = window.define;
//
//				window.require = function () {
//					window.$(document.body).removeClass("-preloader-inactive");
//					return _rq.apply(this, arguments);
//				};
//
//				window.define = function () {
//					window.$(document.body).addClass("-preloader-inactive");
//					return _df.apply(this, arguments);
//				};

				return window.jQuery;
			}
		},
		underscore: {
			exports: '_'
		},
		'jquery.swipe': {
			deps: [
				'jquery.move'
			]
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		chaplin: {
			deps: [
				'backbone'
			]
		},
		handlebars: {
			deps: [
				'bootstrap'
			],
			exports: 'Handlebars'
		}
	}

});