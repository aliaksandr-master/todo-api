define(function(require, exports, module){
    'use strict';

    var Chaplin = require('chaplin');
    var _ = require('underscore');

	var BaseModel = Chaplin.Model.extend({

		provider: 'api',

		parse: function (response, options) {
			var data = BaseModel.__super__.parse.apply(this, arguments);
			if (options.collection) {
				return data;
			}
			return data.data;
		}

	});

    return BaseModel;
});