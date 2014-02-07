define(function(require, exports, module){
    "use strict";

    var _ = require('underscore'),
		request = require('lib/request'),
		utils = require('lib/utils'),
		Chaplin = require('chaplin'),
		User = require('models/user');

    var session;

	var UserSession = utils.BackboneClass({

		model: function () {
			return session ? session.clone() : null;
		},

		logged: function () {
			return !_.isEmpty(session);
		},

		current: function () {
			var that = this;
			request.load('/user/current', 'api', true).then(function (data) {
				that.login(new User(data.data, {parse: true}));
			});
		},

		login: function (model) {
			session = this.user = model.clone();
			this.trigger('user:login');
		},

		logout: function () {
			session = this.user = null;
			request.load('/user/logout', 'api');
			this.trigger('user:logout');

			setTimeout(function(){
				window.location.href = '/';
			}, 500);
		}
	});

	var user = new UserSession();

	user.current();

	return user;
});