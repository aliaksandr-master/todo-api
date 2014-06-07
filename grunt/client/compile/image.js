"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/client/images'
	]);

	this.copy({
		files: [
			{
				expand: true,
				cwd: this.SRC + "/client/static/",
				src: [
					'images/**/*.{png,jpg,jpeg,svg,gif,ico}',
					'images/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/**/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/*.{png,jpg,jpeg,gif,svg,ico}'
				],
				dest: this.BUILD + "/client/static/"
			},
			{
				src: this.SRC + '/client/static/favicon.ico',
				dest: this.BUILD + '/client/static/favicon.ico'
			}
		]
	});

};