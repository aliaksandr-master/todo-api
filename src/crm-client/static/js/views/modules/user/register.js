define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/user/register');

	require('css!styles/modules/user/register');

	var UserLoginPageView = BaseView.extend({

		render: function(){
			BaseView.prototype.render.apply(this,arguments);
			this.formSubmit({
				success: function(data){
					this.trigger('registered', data);
				}.bind(this)
			});
		},

		template: template,

		autoRender: true

	});

	template = null;

	return UserLoginPageView;
});

