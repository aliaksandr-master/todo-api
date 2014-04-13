"use strict";

var grunt = require('grunt');

module.exports = function (fileName, options) {

	var done = this.async();
	var ramlPrser = require(global.ROOT + '/node_require/raml-js-parser/lib/raml');

	ramlPrser.loadFile(global.ROOT+'/src/api/definition/modules/session.raml').then(function(data) {

	grunt.file.write(global.ROOT+'/src/api/definition/modules/session-result.json', JSON.stringify(data, null, 4));
		done();
	}, function(error) {
		throw new Error(error);
	});

};