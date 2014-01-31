require.config({

	enforceDefine: false,

	baseUrl: '/client/static-${config:cacheKey}/js/',

	paths: {

		'bootstrap': '../vendor/bootstrap/custom/js/bootstrap.min',
		'styles': '../styles',
		'vendor': '../vendor',
		'templates': '../templates',
		'jquery': '../vendor/jquery/jquery',
		'jqueryui': '../vendor/jqueryui/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min',
		'underscore': '../vendor/underscore/underscore',
		'backbone': '../vendor/backbone/backbone',
		'backbone.shim': 'shim/backbone.shim',
		'backbone.dualStorage': '../vendor/backbone.dualstorage/backbone.dualstorage.amd',
		'backbone.stickit': '../vendor/backbone.stickit/backbone.stickit',
		'handlebars': '../vendor/handlebars/handlebars',
		'chaplin': '../vendor/chaplin/chaplin',
		'jquery.swipe': '../vendor/jquery.event.swipe/jquery.event.swipe',
		'jquery.move':  '../vendor/jquery.event.move/jquery.event.move'

	},

	map:{

		'*':{
			'text': 'vendor/requirejs-text/text',
			'css': 'vendor/require-css/css'
		}
	},

	shim: {
		jquery: {
			exports: 'jQuery'
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