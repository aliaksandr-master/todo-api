define(function(require, exports, module){
	"use strict";

	var BaseProvider = require('lib/providers/base/provider');

	return BaseProvider.extend({

		version: '',

		base: 'crm-client/',

		defaultParams: {
			dataType: 'json',
			contentType: 'json'
		}

	});
});