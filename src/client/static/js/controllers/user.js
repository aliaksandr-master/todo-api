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
				this.redirectTo('todo-lists');
			});
		},

		login: function () {
			this.view = new PageUserLoginView({
				region: "main"
			});

			this.listenTo(this.view, 'trigger:login', function (data) {
				this.user = new UserModel(data.data, {parse: true});
				userSession.login(this.user);
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
			this.initMenu();
		},

		register: function(params){
			this.view = new PageUserRegisterView({region: "main"});
			this.listenTo(this.view, 'registered', function(data){
				this.redirectTo('user-login');
			});
		}

	});

    return UserController;
});