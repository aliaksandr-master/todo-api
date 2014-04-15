"use strict";
module.exports = function (grunt) {

	return {
		'build-opt': {
			options: {
				excludeEmpty: true
			},
			files: [
				{
					expand: true,
					cwd: "src/opt/",
					src: [
						"codeigniter/**/*",
						"api/**/*",
						"helpers/**/*",
						".htaccess",
					],
					dest:   "build/opt"
				}
			]
		}
	};
};