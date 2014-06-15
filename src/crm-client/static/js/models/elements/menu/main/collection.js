define(function(require){
	'use strict';

	var BaseCollection = require('models/base/collection');
	var MainMenuModel = require('./model');

	var MainMenuCollection = BaseCollection.extend({

		model: MainMenuModel

	});

	return MainMenuCollection;

});