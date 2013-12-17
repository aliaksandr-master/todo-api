define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/pages/about');

	var AboutPageView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return AboutPageView;
});