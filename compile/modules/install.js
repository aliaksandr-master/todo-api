"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('copy-new-files:config', {
		files: [
			{
				expand: true,
				cwd: path.SRC + '/configs',
				src: '**/*.json',
				dest: path.ROOT + '/_local/configs'
			}
		]
	});

	this.config('clean:installed', [
		path.TMP
	], false);

	this.config('jshint:compile', {
		src: [
			path.ROOT + '/Gruntfile.js',
			path.COMPILE + '/**/*.{js,json}'
		]
	}, false);

	this.config('jshint:src', {
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