'use strict';

module.exports = function (grunt) {
	var opt = this;

	this.run('copy-new-files:config', {
		files: [{
			expand: true,
			cwd: opt.SRC + '/configs',
			src: '**/*.json',
			dest: opt.DEV + '/configs'
		}]
	}, false);

	this.run('clean:temp', [
		opt.VAR
	]);

	this.run('jshint:compile', {
		src: [
			opt.CWD + '/Gruntfile.js',
			opt.GRUNT + '/**/*.{js,json}'
		]
	});

	this.run('jshint:src', {
		src: [
			opt.SRC + '/**/*.{js,json}',
			'!' + opt.SRC + '/client/static/vendor/**/*.{js,json}',
			'!' + opt.SRC + '/api-tester/vendor/**/*.{js,json}'
		]
	});

	this.run('copyByConfig:vendor', {
		files: [
			{
				expand: true,
				cwd:  opt.SRC,
				src: '**/vendor.runtime.json',
				dest: opt.BUILD
			}
		]
	}, false);

	this.add([
		'jshint:install/compile',
		'jshint:install/src',
		'copy-new-files:install/config',

		'clean:install/temp',
		'opt/install',
		'database/install',
		'api/install',
		'api-tester/install',
		'client/install',
		'copyByConfig:install/vendor'
	]);

};