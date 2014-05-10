"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('template', {
		options: {
			data: {
				routes: function() {
					return require(opt.SRC + '/client/static/config/route.json');
				}
			}
		},
		files: [
			{
				src: opt.GRUNT + '/run/client/assets/route.tpl',
				dest: opt.BUILD + '/client/static/js/routes.js'
			}
		]
	});

};