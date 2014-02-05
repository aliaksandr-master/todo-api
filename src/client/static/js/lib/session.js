define(function(require, exports, module){
    "use strict";

    var _ = require('underscore'),
		request = require('lib/request'),
		utils = require('lib/utils'),
		Chaplin = require('chaplin'),
		User = require('models/user');

    var session;
    request.load('/user/current', 'api', true).then(function (data) {
        session = new User(data.data, {parse: true});
    });

	var UserSession = utils.BackboneClass({

		logged: function () {
			return !_.isEmpty(session);
		},

		login: function (model) {
			if(model.isValid()){
				session = model;
				this.user = model;
				this.trigger('user:login');
			}
		},

		logout: function () {
			session = {};
			this.user = null;
			request.load('/user/logout', 'api');
			this.trigger('user:logout');
		}
	});

	return new UserSession();
});