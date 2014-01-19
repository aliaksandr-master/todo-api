define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view'),
		template = require('templates/user/profile');
	require('css!styles/user/profile');

	var UserProfilePageView = BaseView.extend({

		template: template,

		autoRender: true

	});

	template = null;

	return UserProfilePageView;
});
