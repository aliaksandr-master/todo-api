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

	return null;
});