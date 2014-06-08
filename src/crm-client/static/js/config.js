'use strict';

require.config({

	enforceDefine: false,

	baseUrl: '/crm-client/static-${config:buildTimestamp}/js/',

	paths: {
		'styles': '../styles',
		'packages': '/opt/frontend/bower',
		'templates': '../templates'
	},

	map:{

		'*':{
			'text': 'packages/requirejs-text/text',
			'css':  'packages/require-css/css',

			'jquery': 'packages/jquery/jquery',
			'underscore': 'packages/lodash/dist/lodash',
			'lodash': 'packages/lodash/dist/lodash',
			'bootstrap': 'packages/bootstrap/custom/js/bootstrap.min',
			'backbone': 'packages/backbone/backbone',
			'backbone.dualStorage': 'packages/backbone.dualstorage/backbone.dualstorage.amd',
			'backbone.stickit': 'packages/backbone.stickit/backbone.stickit',
			'handlebars': 'packages/handlebars/handlebars',
			'chaplin': 'packages/chaplin/chaplin',

			'jquery-ui': 'packages/jquery-ui-amd/jqueryui',

			'jquery.swipe': 'packages/jquery.event.swipe/jquery.event.swipe',
			'jquery.move':  'packages/jquery.event.move/jquery.event.move',

			'jquery-ui-touch-punch': 'packages/jquery-ui-touch-punch-amd/jquery.ui.touch-punch',

		}

	},

	shim: {
		'packages/jquery/jquery': {
			exports: 'jQuery'
		},
		'packages/bootstrap/custom/js/bootstrap.min': {
			deps: ['packages/jquery/jquery']
		},
		'packages/jquery-ui-amd/jqueryui': {
			deps: ['packages/jquery/jquery']
		},
		'packages/jquery.event.swipe/jquery.event.swipe': {
			deps: [
				'packages/jquery.event.move/jquery.event.move'
			]
		},
		backbone: {
			exports: 'Backbone'
		},
		'packages/handlebars/handlebars': {
			exports: 'Handlebars'
		}
	}

});