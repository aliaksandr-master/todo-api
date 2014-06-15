define(function(require, exports, module){
    'use strict';

    var Chaplin = require('chaplin');
    var LayoutView = require('views/layout');
	var preloader = require('lib/preloader');

	var user = require('lib/session');
	var request = require('lib/request');

	var BaseController = Chaplin.Controller.extend({

		user: user,

		request: request,

		getLayout: function () {
			return LayoutView;
		},

		beforeAction: function () {
			this.reuse("layout", this.getLayout());
			BaseController.__super__.beforeAction.apply(this, arguments);
		},

		initialize: function(){
			BaseController.__super__.initialize.apply(this, arguments);
			preloader.off();
		}

	});

    return BaseController;
});