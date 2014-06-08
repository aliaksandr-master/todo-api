'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.clean([
		opt.lnk(opt.BUILD)
	]);

	this.bower({
		options: {
			verbose: true,
			copy: false
		}
	});

	this.copy({
		files: [{
			expand: true,
			cwd:  opt.OPT + '/frontend/vendor',
			src: '**/*',
			dest: opt.lnk(opt.BUILD, 'static/vendor')
		}]
	});

};