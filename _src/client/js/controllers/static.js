define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');
    var PageHomeView = require('views/pages/home');
    var PageAboutView = require('views/pages/about');

	var StaticController = BaseController.extend({

		home: function(){
			this.view = new PageHomeView({
				region: "main"
			});
		},

		about: function(){
			this.view = new PageAboutView({
				region: "main"
			});
		}

	});

    return StaticController;
});