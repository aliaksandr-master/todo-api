define(function(require, exports, module){
	"use strict";

	var $ = require('jquery');

	var template = require('templates/elements/main-menu');
	var BaseView = require('views/base/view');
	var sessionUser = require('lib/session');

	require('css!styles/index');
	require('css!styles/layouts/simple');

	var MainMenuView = BaseView.extend({

		autoRender: true,

		template: template

	});

	return MainMenuView;
});