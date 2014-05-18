"use strict";

define(function(require, exports, module){

	var _ = require('lodash');

	return {

		replacer: function (options) {
			return function(match, pIndent, pKey, pVal, pEnd) {
				var key = '<span class="' + options.keyClassName +'">';
				var val = '<span class="' + options.valClassName +'">';
				var str = '<span class="' + options.strClassName +'">';
				var r = '';
				if (pKey) {
					r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
				}
				if (pVal) {
					r = r + (pVal[0] === '"' ? str : val) + pVal + '</span>';
				}
				return '<div style="padding-left: ' + (options.spaces ? pIndent / options.spaces : 0) + 'px" class="' + options.rowClassName + '">' + r + (pEnd || '') + '</div>';
			};
		},

		prettyPrint: function(obj, options) {

			options = _.extend({
				spaces: 4,
				sepPadding: 10,
				rowClassName: 'json-row',
				keyClassName: 'json-key',
				valClassName: 'json-val',
				strClassName: 'json-str'
			}, options);

			var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
			return JSON.stringify(obj, null, options.spaces)
				.replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
				.replace(/</g, '&lt;').replace(/>/g, '&gt;')
				.replace(jsonLine, this.replacer(options));
		}
	};

});