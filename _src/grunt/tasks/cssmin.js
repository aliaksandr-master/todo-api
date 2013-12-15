"use strict";
module.exports = function(grunt){

	return {

		env_testing: {
			files: {
				expand: true,
				cwd: "build_testing/client/styles/",
				src: [
					'**/*.{css}',
					'*.{css}'
				],
				dest: "build_testing/client/styles/"
			}
		},

		env_development: {
			files: {
				expand: true,
				cwd: "build_development/client/styles/",
				src: [
					'**/*.{css}',
					'*.{css}'
				],
				dest: "build_development/client/styles/"
			}
		},

		env_production: {
			files: {
				expand: true,
				cwd: "build_production/client/styles/",
				src: [
					'**/*.{css}',
					'*.{css}'
				],
				dest: "build_production/client/styles/"
			}
		}

	};
};