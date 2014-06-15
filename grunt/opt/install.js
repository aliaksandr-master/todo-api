'use strict';

module.exports = function () {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.clean([
			opt.BUILD + '/opt'
		])

		.symlink({
			options: {
				overwrite: true,
				type: 'dir'
			},
			target: opt.CWD + '/opt',
			link: opt.BUILD + '/opt'
		})
	;

};