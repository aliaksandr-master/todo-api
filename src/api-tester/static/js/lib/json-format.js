define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	return function(obj, options){
		options = _.extend({
			stringQuotes: false,
			lastComma: true,
			indent: 2,
			unindent: 0,
			unwrapFirstBrace: false
		}, options);

		var json = JSON.stringify(obj, null, options.indent);

		if (options.unindent) {
			json = json.replace(new RegExp('^ {' + (options.unindent * options.indent) + '}', 'mg'), '');
		}
		if (options.unwrapFirstBrace) {
			json = json.replace(/^\s*\[|\{[^\n]*\n([\S\s]*?)\s*[\}\]]\s*$/, '$1');
		}
		if (!options.lastComma) {
			json = json.replace(/\s*,\s*$/mg, '');
		}

		json = json.replace(/^(\s*".*?"\s*\:\s*)?['"](.*)['"]\s*(,?)\s*$/gm, '$1<span class=\'json-string\'>' + (options.stringQuotes ? '"$2"' : '$2') + '</span>$3');
		json = json.replace(/^(\s*)"(.*?)"\s*(,?)\s*$/gm, '$1<span class=\'json-string\'>' + (options.stringQuotes ? '"$2"' : '$2') + '</span>$3');
		json = json.replace(/^(\s*)(\d+)\s*([^\w\d]*)$/gm, '$1<span class=\'json-number\'>$2</span>$3');
		json = json.replace(/^(\s*)(true|false)\s*([^\w\d]*)$/gm, '$1<span class=\'json-bool\'>$2</span>$3');
		json = json.replace(/^(\s*)(null)\s*([^\w\d]*)$/gm, '$1<span class=\'json-null\'>$2</span>$3');
		json = json.replace(/^(\s*)"(.+?)"\s*\:\s*(.*)$/gm, '$1<span class=\'json-index\'>$2</span><span class=\'json-coma\'>:</span> $3');
		json = json.replace(/([\{\}\[\]])/g, '<span class=\'json-braked\'>$1</span>');
		json = json.replace(/([^\w\d])(true|false)([^\w\d]*)$/gm, '$1<span class=\'json-bool\'>$2</span>$3');
		json = json.replace(/([^\w\d])(null)([^\w\d]*)$/gm, '$1<span class=\'json-null\'>$2</span>$3');
		json = json.replace(/([^\w\d])((?:[+-])?(?:\d+\.)?\d+)([^\w\d]*)$/gm, '$1<span class=\'json-number\'>$2</span>$3');

		return json;
	};
});