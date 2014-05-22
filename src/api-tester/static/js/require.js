'use strict';

require.config({

	baseUrl: '/api-tester/static/js/',

	paths: {

		styles:    '../styles',
		modules: 'modules',
		templates: '../templates',

		vendor:   '../../../opt/frontend/vendor',
		packages: '../../../opt/frontend/bower',
		opt:   '../../../opt/frontend/custom',

		URIjs: '../../../opt/frontend/bower/URIjs/src'

	},

	map: {
		'*':{

			jquery: 'packages/jquery/jquery',
			backbone: 'packages/backbone/backbone',
			handlebars: 'packages/handlebars/handlebars',
			lodash: 'packages/lodash/dist/lodash',
			underscore: 'packages/lodash/dist/lodash',
			bootstrap: 'vendor/bootstrap/custom/js/bootstrap.min',

			'text': 'packages/requirejs-text/text',
			'css':  'packages/require-css/css'
		}
	},

	shim: {
		'packages/jquery/jquery': {
			init: function(){
				return window.jQuery;
			}
		},
		'vendor/bootstrap/custom/js/bootstrap.min': {
			deps: ['packages/jquery/jquery']
		},
		'packages/handlebars/handlebars': {
			init: function () {
				return window.Handlebars;
			}
		}
	}

});

define('main/app', function (require, exports, module) {
	var $ = require('jquery');

	return function () {
	};
});

require(['jquery', 'main/app'], function ($, app) {
	app();
});