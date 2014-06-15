'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.jsonMerge({
			options: {
				processContent: function (content, fpath, dest) {
					var name = fpath.replace(/^(.+?)[\/\\](en|ru)[\/\\](.+?)\.[a-zA-Z]+$/, '$3');
					var obj = {};
					obj[name] = content;
					return obj;
				},
				beautify: true
			},
			files: [
				{
					expand: true,
					cwd: opt.lnk(opt.SRC, 'lang/en'),
					src: [ '**/*.json' ],
					dest: opt.lnk(opt.VAR, 'lang/en.json')
				},
				{
					expand: true,
					cwd: opt.lnk(opt.SRC, 'lang/ru'),
					src: [ '**/*.json' ],
					dest: opt.lnk(opt.VAR, 'lang/ru.json')
				}
			]
		})

		.jsonMerge('withDefault', {
			options: {
				beautify: true
			},
			files: [{
				src: [
					opt.lnk(opt.VAR, 'lang/en.json'),
					opt.lnk(opt.VAR, 'lang/ru.json')
				],
				dest: opt.lnk(opt.VAR, 'lang/ru.json')
			}]
		})

		.copy({
			files: [{
				expand: true,
				cwd: opt.lnk(opt.VAR, 'lang'),
				src: '*.json',
				dest: opt.lnk(opt.BUILD, 'var/lang')
			}]
		})
	;

};