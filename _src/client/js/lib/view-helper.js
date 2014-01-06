define(function(require, exports, module){
    "use strict";

    var Handlebars = require('handlebars');
    var Chaplin = require('chaplin');
    var utils = require('lib/utils');

	Handlebars.registerHelper('url', function() {
		var options, params, routeName, _i;
		routeName = arguments[0], params = 3 <= arguments.length ? Array.prototype.slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), options = arguments[_i++];
		return Chaplin.helpers.reverse(routeName, params);
	});

	Handlebars.registerHelper('firstRow', function() {
		return (arguments[0] == null ? "" : arguments[0]).replace(/^\s+/, "").split(/[\n\r]+/).shift();
	});

	Handlebars.registerHelper('plus', function() {
		return arguments[0] + arguments[1];
	});

	return null;
});