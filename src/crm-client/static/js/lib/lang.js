define(function(require, exports, module){
    "use strict";

	var request = require('lib/request');
	var DEFAULT_LANG = 'ru';

	var translates = {};
	request.load('/var/lang/' + DEFAULT_LANG + '.json', 'self', true).then(function (json) {
		translates = json;
	});

    return {
		lang: DEFAULT_LANG,
		translates: translates
	};
});