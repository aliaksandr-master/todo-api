define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	return function(obj){
		var json = JSON.stringify(obj, null, 2);
		json = json.replace(/^(\s*".*?"\s*\:\s*)?['"](.*)['"]\s*(,?)\s*$/gm, '$1<span class=\'json-string\'>"$2"</span>$3');
		json = json.replace(/^(\s*)"(.*?)"\s*(,?)\s*$/gm, '$1<span class=\'json-string\'>"$2"</span>$3');
		json = json.replace(/^(\s*)(\d+)\s*([^\w\d]*)$/gm, '$1<span class=\'json-number\'>$2</span>$3');
		json = json.replace(/^(\s*)(true|false)\s*([^\w\d]*)$/gm, '$1<span class=\'json-bool\'>$2</span>$3');
		json = json.replace(/^(\s*)"(.+?)"\s*\:\s*(.*)$/gm, '$1<span class=\'json-index\'>$2</span><span class=\'json-coma\'>:</span> $3');
		json = json.replace(/([\{\}\[\]])/g, '<span class=\'json-braked\'>$1</span>');
		json = json.replace(/([^\w\d])(true|false)([^\w\d]*)$/gm, '$1<span class=\'json-bool\'>$2</span>$3');
		json = json.replace(/([^\w\d])((?:[+-])?(?:\d+\.)?\d+)([^\w\d]*)$/gm, '$1<span class=\'json-number\'>$2</span>$3');
		return json;
	};
});