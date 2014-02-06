define(function(require, exports, module){
    "use strict";

	var $ = require('jquery');
    var BaseController = require('controllers/base/controller'),
		UserModel = require('models/user'),
		userSession = require('lib/session'),
		PageUserRegisterView = require('views/user/register'),
		PageUserLoginView = require('views/user/login'),
		PageUserProfileView = require('views/user/profile');

	var UserController = BaseController.extend({

		initialize: function () {
			UserController.__super__.initialize.apply(this, arguments);

			this.listenTo(userSession, 'user:login', function () {
				this.redirectTo({url:'/todo/'});
			});

			this.listenTo(userSession, 'user:logout', function () {
				this.redirectTo({url: '/'});
			});
		},

		login: function (params) {
			this.view = new PageUserLoginView({
				region: "main"
			});

			this.listenTo(this.view, 'logged', function (data) {
				var user = new UserModel(data.data, {parse: true});
				userSession.login(user);
			});
		},

		logout: function () {
			userSession.logout();
		},

		profile: function(params){
			this.view = new PageUserProfileView({
				model: userSession.model(),
				region: "main"
			});
		},

		register: function(params){
			this.view = new PageUserRegisterView({region: "main"});
			this.listenTo(this.view, 'registered', function(data){
				var user = new UserModel(data, {parse: true});
				if(user.isValid()){
					userSession.login(user);
				}
				this.redirectTo({url:'/todo/'});
			});
		}

	});

    return UserController;
});