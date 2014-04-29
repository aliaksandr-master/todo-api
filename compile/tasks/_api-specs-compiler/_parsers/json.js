"use strict";



module.exports = function (fileName, destFile, options, mainOptions) {
	var utils = require('./../_utils')(options, mainOptions);

	var source = require(fileName);

	return {
		source: source,
		parsed: utils.compile(source, fileName, destFile)
	};
};