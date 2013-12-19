define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var SimpleLayoutView = require('views/layouts/simple');

	var BaseController = Chaplin.Controller.extend({

		beforeAction: function(){
			this.compose("site", SimpleLayoutView);
			$('.pre-loader').removeClass("-inactive");
			console.log('pre-loader active');
		}

	});

    return BaseController;
});