define(function(require, exports, module){
	"use strict";

	var BaseProvider = require('lib/providers/base/provider');

	return BaseProvider.extend({

		version: '',

		base: window.moduleName + '/',

		defaultParams: {
			dataType: 'json',
			contentType: 'json'
		}

	});
});