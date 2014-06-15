'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.clean([
			BUILD + '/static/templates'
		])

		.handlebars({
			options: {
				namespace: false,
				amd: true,
				processContent: function(content){
					return content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '').replace(/[\r\n]+/g, '');
				}
			},
			files: [{
				expand: true,
				cwd: SRC + '/static/templates',
				src: '**/*.hbs',
				dest: BUILD + '/static/templates',
				ext: '.js'
			}]
		})
	;

};