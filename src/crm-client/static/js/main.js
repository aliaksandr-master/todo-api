define(function(require){
	'use strict';

	require('shim/backbone');
	require('backbone.stickit');

	var
		routes = require('routes'),
		Application = require('application')
	;

	if(window.localStorage && localStorage.getItem('build') !== window.build){
		localStorage.clear();
		localStorage.setItem('build', window.build);
	}

	return new Application({

		// ROUTES
		routes: routes,
		pushState: true,
		hashChange: true,
		root: '/',
		trailing: true,

		// DISPATCHER
		controllerPath: 'controllers/',
		controllerSuffix: ''

	});

});