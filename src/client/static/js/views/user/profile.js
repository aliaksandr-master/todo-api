define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view'),
		template = require('templates/user/profile');
	require('css!styles/user/profile');

	var UserProfilePageView = BaseView.extend({

		initialize: function(){
			var that = this;
			BaseView.prototype.initialize.apply(this,arguments);
			this.formSubmit({
				success: function(data){
					that.trigger('registered', data);
				}
			});
		},

		template: template,

		autoRender: true

	});

	template = null;

	return UserProfilePageView;
});
