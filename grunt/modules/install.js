"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.run('copy-new-files:config', {
		files: [
			{
				expand: true,
				cwd: path.SRC + '/configs',
				src: '**/*.json',
				dest: path.DEV + '/configs'
			}
		]
	});

	this.run('clean:installed', [
		path.TMP
	], false);

	this.run('jshint:compile', {
		src: [
			path.CWD + '/Gruntfile.js',
			path.GRUNT + '/**/*.{js,json}'
		]
	}, false);

	this.run('jshint:src', {
		src: [
			path.SRC + '/**/*.{js,json}',
			'!' + path.SRC + '/client/static/vendor/**/*.{js,json}',
			'!' + path.SRC + '/opt/**/*.{js,json}'
		]
	}, false);

	this.alias([
		'jshint:compile',
		'jshint:src',
		'copy-new-files:install/config',

		"clean:installed",
		"opt/install",
		"database/install",
		"api/install",
		"api/tester/install",
//		"client/install"
	]);

};