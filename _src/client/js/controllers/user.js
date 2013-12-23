define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');
    var PageUserRegisterView = require('views/user/register');
    var PageUserLoginView = require('views/user/login');
    var PageUserProfileView = require('views/user/profile');

	var UserController = BaseController.extend({

		login: function(params){
			this.view = new PageUserLoginView({
				region: "main"
			});
			this.preloader.off();
		},

		profile: function(params){
			this.view = new PageUserProfileView({
				region: "main"
			});
			this.preloader.off();
		},

		register: function(params){
			this.view = new PageUserRegisterView({
				region: "main"
			});
			this.preloader.off();
		}

	});

    return UserController;
});