define(function(require){
	'use strict';

	require('lib/shim/backbone');

	var Chaplin = require('chaplin');
	var routes = require('routes');

	var Application = Chaplin.Application.extend({});

//	if(window.localStorage && localStorage.getItem('build') !== window.build){
//		localStorage.clear();
//		localStorage.setItem('build', window.build);
//	}

	return new Application({

		// ROUTES
		routes: routes,
		pushState: true,
		hashChange: true,
		root: '/crm/',
		trailing: true,

		// DISPATCHER
		controllerPath: 'controllers/modules/',
		controllerSuffix: ''

	});

});