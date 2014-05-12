"use strict";

module.exports = function (fileName, destFile, options, mainOptions) {
	var compile = require('./../utils')(options, mainOptions);
	return compile(require(fileName), fileName, destFile);
};