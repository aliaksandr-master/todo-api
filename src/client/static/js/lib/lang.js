define(function(require, exports, module){
    "use strict";

	var request = require('lib/request');

	var lang = {};
	request.load('/_generated_/lang.en.json', 'api', true).then(function (json) {
		lang = json;
	});

    return lang;
});