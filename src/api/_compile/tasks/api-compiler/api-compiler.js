"use strict";
module.exports = function(grunt){

	var _ = require('underscore');
	var json2phpArray = require(this.SRC + '/_compile/utils.js').json2phpArray;
	var sha1 = require('sha1');

	var options = require(this.SRC + '/api/definition/options.js');
	var mainOptions = {
		cwd: 'src/api/definition/modules/',
		src: [
			'*.js',
			'**/*.js'
		],
		jsonSpaces: 4,
		apiRoot: '/api',
		verbose: false,
		destSourceJsonFile: 'build/api/var/api.source.json',
		destParsedJsonFile: 'build/api/var/api.parsed.json',
		destDir: 'build/api/var/system/'
	};

	var utils = require('./_utils.js')(options, mainOptions);

	mainOptions.cwd = mainOptions.cwd.replace(/[\\\/]*$/, '/');

	return function () {
		var fs = grunt.file.expand({cwd: mainOptions.cwd}, mainOptions.src);
		var source = {};

		_.each(fs, function(fpath){
			fpath = global.ROOT + '/' + mainOptions.cwd + fpath;

			_.extend(source, require(fpath));
		});

		// compile
		var parsed = utils.compile(source);

		_.each(parsed, function (value, name) {
			var file = mainOptions.destDir + sha1(name) +'.php';
			grunt.file.write(file, '<?php \nreturn ' + json2phpArray(value) + ';');
			grunt.log.ok(value.name + ', file: ' + file);
		});

		grunt.file.write(mainOptions.destSourceJsonFile, JSON.stringify(source, null, mainOptions.jsonSpaces));
		grunt.file.write(mainOptions.destParsedJsonFile, JSON.stringify(parsed, null, mainOptions.jsonSpaces));

		grunt.log.ok('file ' + mainOptions.destSourceJsonFile,' was created');
		grunt.log.ok('file ' + mainOptions.destParsedJsonFile,' was created');
		grunt.log.ok('total: ' + _.keys(parsed).length + ' items');
	};

};