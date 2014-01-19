define(function(require, exports, module){
    "use strict";

	var $ = require('jquery');
    var BaseController = require('controllers/base/controller'),
		UserModel = require('models/user'),
		Session = require('lib/session'),
		PageUserRegisterView = require('views/user/register'),
		PageUserLoginView = require('views/user/login'),
		PageUserProfileView = require('views/user/profile');

	var UserController = BaseController.extend({

		login: function(params){
			this.view = new PageUserLoginView({
				region: "main"
			});
			this.listenTo(this.view, 'logged', function(data){
				if(data){
					var user = new UserModel(data, {parse: true});
					if(user.isValid()){
						Session.login(user);
						this.redirectTo({url:'/todo/'});
					}
				}
			});
			this.preloader.off();
		},

		logout: function(){
			Session.logout();
			$.get('/server/user/logout');
			this.redirectTo({url: '/'});
			this.preloader.off();
		},

		profile: function(params){
			this.view = new PageUserProfileView({region: "main"});
			this.preloader.off();
		},

		register: function(params){
			this.view = new PageUserRegisterView({region: "main"});
			this.listenTo(this.view, 'registered', function(data){
				var user = new UserModel(data, {parse: true});
				if(user.isValid()){
					Session.login(user);
				}
				this.redirectTo({url:'/todo/'});
			});
			this.preloader.off();
		}

	});

    return UserController;
});