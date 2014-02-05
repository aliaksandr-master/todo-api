define(function(require, exports, module){
    "use strict";

    var BaseView = require('views/base/view'),
		template = require('templates/user/login');

	require('css!styles/user/login');

	var UserLoginPageView = BaseView.extend({

		initialize: function(){
			var that = this;
			BaseView.prototype.initialize.apply(this,arguments);
			this.formSubmit({
				success: function(data){
					that.trigger('logged', data);
				}
			});
		},

		template: template,

		autoRender: true

	});

	template = null;

    return UserLoginPageView;
});
