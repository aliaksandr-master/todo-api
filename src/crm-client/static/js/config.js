'use strict';

require.config({

	enforceDefine: false,

	baseUrl: '/${module:NAME}/static-${build:timestamp}/js/',

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
			'lodash': 'packages/lodash/dist/lodash',
			'underscore': 'packages/lodash/dist/lodash',
			'bootstrap': 'packages/bootstrap/custom/js/bootstrap',
			'backbone': 'packages/backbone/backbone',
			'handlebars': 'packages/handlebars/handlebars',
			'chaplin': 'packages/chaplin/chaplin'
		}

	},

	shim: {
		'packages/jquery/jquery': {
			exports: 'jQuery'
		},
		'packages/bootstrap/custom/js/bootstrap': {
			deps: ['packages/jquery/jquery']
		},
		backbone: {
			exports: 'Backbone'
		},
		'packages/handlebars/handlebars': {
			exports: 'Handlebars'
		}
	}

});