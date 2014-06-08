'use strict';

define(function(require){

	require('lib/shim/backbone');
	require('backbone.stickit');
	require('bootstrap');

	var routes = require('routes');
	var Application = require('application');
	var lang = require('lib/lang');

	if(window.localStorage && localStorage.getItem('build') !== window.build){
		localStorage.clear();
		localStorage.setItem('build', window.build);
	}

	return new Application({

		// ROUTES
		routes: routes,
		pushState: true,
		hashChange: true,
		root: '/' + lang.lang + '/',
		trailing: true,

		// DISPATCHER
		controllerPath: 'controllers/',
		controllerSuffix: ''

	});
});