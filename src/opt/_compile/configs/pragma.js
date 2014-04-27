"use strict";
module.exports = function (grunt) {

	return {
		'inject': {
			options: {
				processors: {
					injectData: function (pragma, fpath) {
						var path = require('path');
						var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;

						var jsonFile = pragma.params[0];
						var resultData = grunt.file.readJSON(jsonFile);
						if (pragma.params[1]) {
							resultData = resultData[pragma.params[1]];
						}

						var ext = path.extname(fpath);

						if (ext == '.php') {
							resultData = json2php(resultData);
							return resultData;
						} else if (ext == '.js') {
							resultData = JSON.stringify(resultData, null, null);
							return resultData;
						}

						return null;
					}
				}
			},
			files: [
				{
					expand: true,
					cwd: this.BUILD + "/api/",
					src: [
						"**/*.php"
					],
					dest:   this.BUILD + "/api/"
				}
			]
		}
	};
};