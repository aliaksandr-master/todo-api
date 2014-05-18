'use strict';

require.config({

	baseUrl: '/api-tester/static/js/',

	paths: {

		'styles':    '../styles',
		'modules': 'modules',
		'templates': '../templates',

		'vendor':   '../../../opt/frontend/vendor',
		'packages': '../../../opt/frontend/bower',
		'custom':   '../../../opt/frontend/custom'
	},

	map: {
		'*':{

			jquery: 'packages/jquery/jquery',
			lodash: 'packages/lodash/lodash',
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
		}
	}

});


require(['jquery', 'modules/start'], function ($, start) {
	start();
});