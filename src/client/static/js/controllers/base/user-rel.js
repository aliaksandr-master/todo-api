define(function(require, exports, module){
	"use strict";

	var BaseController = require('controllers/base/controller');

	var UserRelController = BaseController.extend({

		constructor: function () {
			if (this.user.logged()) {
				return UserRelController.__super__.constructor.apply(this, arguments);
			}
			this.redirectTo('user-login');
		}

	});

	return UserRelController;
});