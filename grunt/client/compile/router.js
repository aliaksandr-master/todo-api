"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.template({
		options: {
			data: {
				routes: function() {
					return require(opt.SRC + '/client/static/config/route.json');
				}
			}
		},
		files: [{
			src: opt.GRUNT + '/_assets/client/route.tpl',
			dest: opt.BUILD + '/client/static/js/routes.js'
		}]
	});

};