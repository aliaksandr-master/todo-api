"use strict";

module.exports = function () {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.copy({
		options: {
			excludeEmpty: true
		},
		files: [{
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
		}]
	});
};