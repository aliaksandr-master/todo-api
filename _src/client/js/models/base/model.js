define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var _ = require('underscore');
	var mainServer = require('lib/servers/main');

	var BaseModel = Chaplin.Model.extend({

		initialize: function(){
			BaseModel.__super__.initialize.apply(this, arguments);
		},

		server: mainServer,

		format: "json"

	});

    return BaseModel;
});