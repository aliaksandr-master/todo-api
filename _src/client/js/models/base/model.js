define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var _ = require('underscore');
	var api = require("api");

	var BaseModel = Chaplin.Model.extend({

		modelName: null,

		parse: function (response) {
			return api(this.modelName).server2client.call(this, response);
		},

		toJSON: function () {
			return api(this.modelName).client2server.call(this, this);
		}

	});

    return BaseModel;
});