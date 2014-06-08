define(function(require, exports, module){
    'use strict';

    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var SimpleLayoutView = require('views/layouts/simple');
    var LoggedLayoutView = require('views/layouts/logged');
	var preloader = require('lib/preloader');

	var user = require('lib/session');
	var request = require('lib/request');

	var BaseController = Chaplin.Controller.extend({

		user: user,

		request: request,

		getLayout: function () {
			var layout =  this.user.logged() ? LoggedLayoutView : SimpleLayoutView;
//			console.log(this.user.logged());
			return layout;
		},

		beforeAction: function () {
			this.reuse("site", this.getLayout());
			BaseController.__super__.beforeAction.apply(this, arguments);
		},

		initialize: function(){
			$(document).off('.mainSwipe').off('swipeleft.mainSwipe');
			$(document).off('.mainSwipe').off('swiperight.mainSwipe');
			BaseController.__super__.initialize.apply(this, arguments);
			preloader.off();
		}

	});

    return BaseController;
});