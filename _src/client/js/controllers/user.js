define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');
    var PageUserRegisterView = require('views/pages/user-register');
    var PageUserLoginView = require('views/pages/user-login');
    var PageUserProfileView = require('views/pages/user-profile');

	var UserController = BaseController.extend({

		login: function(params){
			this.view = new PageUserLoginView({
				region: "main"
			});
		},

		profile: function(params){
			this.view = new PageUserProfileView({
				region: "main"
			});
		},

		register: function(params){
			this.view = new PageUserRegisterView({
				region: "main"
			});
		}

	});

    return UserController;
});