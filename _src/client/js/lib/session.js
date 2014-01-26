define(function(require, exports, module){
    "use strict";

    var _ = require('underscore'),
		request = require('lib/request'),
		User = require('models/user');

	var session = /*window.localStorage.getItem('session') ||*/ '{}';
	session = JSON.parse(session);
	if(session.model){
		session.model = new User(session.model);
	}

	var saveToStore = function(){
//		if(session.model){
//			window.localStorage.setItem('session',JSON.stringify({model: session.model.attributes}));
//		}
	};

	var clearStore = function(){
//		window.localStorage.setItem('session',null);
	};

	var Session = {
		logged: function(){
			return!!session.model;
		},
		login: function(model){
			if(model.isValid()){
				session.model = model;
				saveToStore();
			}
		},
		logout: function(){
			session = {};
			clearStore();
		}
	};

    return Session;
});