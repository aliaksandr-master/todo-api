"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('clean', [
		opt.BUILD + '/client/static/templates'
	]);

	this.run('handlebars', {
		options: {
			namespace: false,
			amd: true,
			processContent: function(content){
				return content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '').replace(/[\r\n]+/g, '');
			}
		},
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/static/templates",
			src: '**/*.hbs',
			dest: opt.BUILD + '/client/static/templates',
			ext: '.js'
		}]
	});
};