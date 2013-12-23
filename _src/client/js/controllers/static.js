define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');
    var PageHomeView = require('views/static/home');
    var PageAboutView = require('views/static/about');

	var StaticController = BaseController.extend({

		home: function(){
			this.view = new PageHomeView({
				region: "main"
			});
			this.preloader.off();
		},

		about: function(){
			this.view = new PageAboutView({
				region: "main"
			});
			this.preloader.off();
		}

	});

    return StaticController;
});