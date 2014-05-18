"use strict";

module.exports = function () {
	var opt = this;

	this.run('clean', [
		opt.BUILD + '/opt'
	]);

	this.run('symlink', {
		options: {
			overwrite: true,
			type: 'dir'
		},
		target: opt.CWD + '/opt',
		link: opt.BUILD + '/opt'
	});
};