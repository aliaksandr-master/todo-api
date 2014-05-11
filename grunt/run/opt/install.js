"use strict";

module.exports = function () {
	var opt = this;

	this.run('copy', {
		options: {
			excludeEmpty: true
		},
		files: [
			{
				expand: true,
				cwd: opt.SRC + "/opt/",
				src: [
					"api/**/*.php",
					"ci_active_record/**/*.php",
					"helpers/**/*.php",
					"router/**/*.php",
					".htaccess"
				],
				dest: opt.BUILD + "/opt/"
			}
		]
	});
};