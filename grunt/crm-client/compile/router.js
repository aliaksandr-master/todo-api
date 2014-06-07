"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.template({
		options: {
			data: {
				routes: function() {
					return require(opt.lnk(opt.SRC, 'static/config/route.json'));
				}
			}
		},
		files: [
			{
				src: opt.GRUNT + '/_assets/client/route.tpl',
				dest: opt.lnk(opt.BUILD, 'static/js/routes.js')
			}
		]
	});

};