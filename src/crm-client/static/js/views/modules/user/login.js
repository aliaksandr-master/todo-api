define(function(require, exports, module){
    "use strict";

    var BaseView = require('views/base/view'),
		template = require('templates/user/login');

	require('css!styles/modules/user/login');

	var UserLoginPageView = BaseView.extend({

		render: function(){
			BaseView.prototype.render.apply(this,arguments);
			this.formSubmit({
				success: function(data){
					this.trigger('trigger:login', data);
				}.bind(this)
			});
		},

		template: template,

		autoRender: true

	});

	template = null;

    return UserLoginPageView;
});
