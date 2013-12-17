define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var SimpleLayoutView = require('views/layout');

	var BaseController = Chaplin.Controller.extend({

		beforeAction: function(){
			this.compose("site", SimpleLayoutView);
		}

	});

    return BaseController;
});