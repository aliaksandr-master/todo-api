"use strict";

module.exports = function () {
	var path = this;

	this.run('copy', {
		options: {
			excludeEmpty: true
		},
		files: [
			{
				expand: true,
				cwd: path.SRC + "/opt/",
				src: [
					"api/**/*.php",
					"ci_active_record/**/*.php",
					"helpers/**/*.php",
					"router/**/*.php",
					".htaccess"
				],
				dest: path.BUILD + "/opt/"
			}
		]
	});
};