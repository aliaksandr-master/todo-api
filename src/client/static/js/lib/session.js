define(function(require, exports, module){
    "use strict";

    var _ = require('underscore'),
		request = require('lib/request'),
		User = require('models/user');

    var session = {};
    request.load('/user/current', 'api', true).then(function (data) {
        session.model = new User(data.data, {parse: true});
    });

    return {
        logged: function(){
            return!!session.model;
        },
        login: function(model){
            if(model.isValid()){
                session.model = model;
            }
        },
        logout: function(){
            session = {};
            request.load('/user/logout', 'api');
        }
    };
});