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
						"api/**/*.php",
						"ci_active_record/**/*.php",
						"helpers/**/*.php",
						"router/**/*.php",
						".htaccess"
					],
					dest:   "build/opt"
				}
			]
		}
	};
};