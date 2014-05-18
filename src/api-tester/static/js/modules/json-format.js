define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	return function(obj){
		var json = JSON.stringify(obj, null, 2);
		json = json.replace(/^(\s*"[^:]*"\s*\:\s*)?['"](.*)['"]([^\w\d]*)?$/gm, '$1<b class=\'string\'>"$2"</b>$3');
		//		json = json.replace(/^(\s*)"([^:]+)"\s*\:\s*(.+)$/gm, '$1<b class=\'index\'>$2</b><i class=\'coma\'>:</i> $3');
		json = json.replace(/([\{\}\[\]])/g, '<i class=\'braked\'>$1</i>');
		json = json.replace(/([^\w\d])(true|false)([^\w\d]*)$/gm, '$1<b class=\'bool\'>$2</b>$3');
		json = json.replace(/([^\w\d])((?:[+-])?(?:\d+\.)?\d+)([^\w\d]*)$/gm, '$1<b class=\'number\'>$2</b>$3');

		return json;
	};
});