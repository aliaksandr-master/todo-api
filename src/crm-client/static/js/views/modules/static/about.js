define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/static/about');

	require('css!styles/static/about');

	var AboutPageView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return AboutPageView;
});