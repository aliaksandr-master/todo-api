define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var SimpleLayoutView = require('views/layouts/simple');
	var preloader = require('lib/preloader');

	var BaseController = Chaplin.Controller.extend({

		preloader: preloader,

		beforeAction: function(){
			this.compose("site", SimpleLayoutView);
//			this.preloader.on();
			BaseController.__super__.beforeAction.apply(this, arguments);
		},

		initialize: function(){
			BaseController.__super__.initialize.apply(this, arguments);
			this.preloader.off();
		}

	});

    return BaseController;
});