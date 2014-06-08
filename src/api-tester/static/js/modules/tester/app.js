define(function(require, exports, module){
    'use strict';

    var _ = require('lodash');
    var Backbone = require('backbone');
	var SpecRouter = require('modules/tester/router');

    return function () {

		var router = new SpecRouter();

		Backbone.history.start({
			pushState: true
		});
	};

});