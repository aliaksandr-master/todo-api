define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view'),
		template = require('templates/user/register');

	require('css!styles/user/register');

	var UserLoginPageView = BaseView.extend({

		initialize: function(){
			var that = this;
			BaseView.prototype.initialize.apply(this,arguments);
			this.formSubmit({
				onSuccess: function(data){
					that.trigger('registered', data);
				}
			});
		},

		template: template,

		autoRender: true

	});

	template = null;

	return UserLoginPageView;
});

