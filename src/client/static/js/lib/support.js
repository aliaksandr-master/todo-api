define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var utils =require('lib/utils');
	var Chaplin = require('chaplin');
	var support;

	support = utils.beget(Chaplin.support);

	return support;
});