"use strict";

module.exports = function(grunt){

	var _ = require('lodash');
	var sha1 = require('sha1');
	var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;

	return {

		'api-specs-methods-config': {
			options: {
				process: function (content, fpath, dest, fileObj) {
					var result = {};

					result[dest] = '<?php \nreturn ' + json2php(content.methods) + ';\n?>';

					return result;
				}
			},
			files: [
				{
					src: this.SRC + '/api/specs-options.js',
					dest: this.BUILD + '/api/var/configs/' + sha1('methods') + '.php'
				}
			]
		},

		'api-specs': {

			options: {
				process: function (content, fpath, dest, fileObj) {
					var result = {};

					var destDir = fileObj.orig.dest.replace(/\/$/, '');

					_.each(content, function (obj, key) {
						result[destDir + '/' + sha1(key) + '.php'] = '<?php \nreturn ' + json2php(obj) + ';\n?>';
					});

					return result;
				}
			},

			files: [{
				expand: true,
				cwd: global.COMPILED + '/api-specs/',
				src: [
					'**/*.json'
				],
				dest: global.BUILD + '/api/var/specs/'
			}]
		}
	};
};