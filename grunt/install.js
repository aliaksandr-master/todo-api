'use strict';

module.exports = function (grunt) {
	var opt = this;


	this.jshint('compile', {
		src: [
			opt.CWD + '/Gruntfile.js',
			opt.GRUNT + '/**/*.{js,json}'
		]
	});

	this.jshint('src', {
		src: [
			opt.SRC + '/**/*.{js,json}',
			'!' + opt.SRC + '/client/static/vendor/**/*.{js,json}',
			'!' + opt.SRC + '/api-tester/vendor/**/*.{js,json}'
		]
	});

	this.bower({
		options: {
			verbose: true,
			copy: false
		}
	});

	this.concat({
		src: [
			opt.OPT + '/frontend/bower/bootstrap-less/js/transition.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/alert.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/button.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/carousel.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/collapse.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/dropdown.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/modal.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/tooltip.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/popover.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/scrollspy.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/tab.js',
			opt.OPT + '/frontend/bower/bootstrap-less/js/affix.js'
		],
		dest: opt.OPT + '/frontend/bower/bootstrap/bootstrap.js'
	});

	this.copyNewFiles('configs', {
		files: [{
			expand: true,
			cwd: opt.SRC,
			src: '**/configs/**/*.json',
			dest: opt.DEV
		}]
	});

	this.clean('temp', [
		opt.VAR
	]);

	this.include([
		'opt/install',
		'database/install',
		'api/install',
		'api-tester/install',
		'listslider-client/install',
		'crm-client/install'
	]);
};