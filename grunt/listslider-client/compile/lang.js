'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.jsonMerge({
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
				cwd: SRC + '/lang/en',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/' + NAME + '/lang/en.json'
			},
			{
				expand: true,
				cwd: SRC + '/lang/ru',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/' + NAME + '/lang/ru.json'
			}
		]
	});

	this.jsonMerge('withDefault', {
		options: {
			beautify: true
		},
		files: [{
			src: [
				opt.VAR + '/' + NAME + '/lang/en.json',
				opt.VAR + '/' + NAME + '/lang/ru.json'
			],
			dest: opt.VAR + '/' + NAME + '/lang/ru.json'
		}]
	});

	this.copy({
		files: [{
			expand: true,
			cwd: opt.VAR + '/' + NAME + '/lang',
			src: '*.json',
			dest: BUILD + '/var/lang'
		}]
	});

};