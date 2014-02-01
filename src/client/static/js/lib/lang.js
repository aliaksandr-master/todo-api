define(function(require, exports, module){
    "use strict";

	var request = require('lib/request');

	var lang = {};
	request.load('/var/lang.en.json', 'self', true).then(function (json) {
		lang = json;
	});

    return lang;
});