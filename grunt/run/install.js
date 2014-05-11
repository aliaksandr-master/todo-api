'use strict';

module.exports = function (grunt) {
	var opt = this;

	this.run('copy-new-files:config', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + '/configs',
				src: '**/*.json',
				dest: opt.DEV + '/configs'
			}
		]
	});

	this.run('clean:temp', [
		opt.TMP
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
			'!' + opt.SRC + '/opt/**/*.{js,json}'
		]
	});

	this.add([
		'jshint:install/compile',
		'jshint:install/src',
		'copy-new-files:install/config',

		'clean:install/temp',
		'opt/install',
		'database/install',
		'api/install',
		'api-tester/install',
		'client/install'
	]);

};