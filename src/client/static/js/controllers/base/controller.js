define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var SimpleLayoutView = require('views/layouts/simple');
	var preloader = require('lib/preloader');

	var MainMenuView = require('views/elements/main-menu');

	var BaseController = Chaplin.Controller.extend({

		beforeAction: function(){
			this.compose("site", SimpleLayoutView);
			BaseController.__super__.beforeAction.apply(this, arguments);
		},

		initMenu: function () {
			if (!this.mainMenu) {
				this.mainMenu = new MainMenuView({
					autoRender: true,
					region: 'main/menu'
				});
			}
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