"use strict";

module.exports = function () {
	var opt = this;

	this.clean([
		opt.BUILD + '/opt'
	]);

	this.symlink({
		options: {
			overwrite: true,
			type: 'dir'
		},
		target: opt.CWD + '/opt',
		link: opt.BUILD + '/opt'
	});
};