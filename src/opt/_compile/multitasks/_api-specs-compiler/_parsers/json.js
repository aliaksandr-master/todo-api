"use strict";



module.exports = function (fileName, options, mainOptions) {
	var utils = require('./../_utils.js')(options, mainOptions);

	var source = require(fileName);

	return {
		source: source,
		parsed: utils.compile(source)
	};
};