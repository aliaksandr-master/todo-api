'use strict';

define(function(require){

	var BackboneShim = require('backbone.shim');
	var BackboneDualStorage = require('backbone.dualStorage');
	var BackboneStickIt = require('backbone.stickit');
	var routes = require("routes");
	var Chaplin = require('chaplin');
	
	
	var Application = Chaplin.Application.extend({});

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

	return new Application({

		routes: routes,
		controllerSuffix: ''

	});
});