'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

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
				src: opt.GRUNT + '/_assets/templates/route.tpl',
				dest: opt.lnk(opt.BUILD, 'static/js/routes.js')
			}
		]
	});

};