define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var _ = require('underscore');

	var BaseModel = Chaplin.Model.extend({

		Name: '',

		provider: 'api'

	});

    return BaseModel;
});