'use strict';

module.exports = function (grunt) {
	var opt = this;

	this.run('json-merge', {
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
				cwd: opt.SRC + '/client/lang/en',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/client/lang/en.json'
			},
			{
				expand: true,
				cwd: opt.SRC + '/client/lang/ru',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/client/lang/ru.json'
			}
		]
	});

	this.run('json-merge:withDefault', {
		options: {
			beautify: true
		},
		files: [{
			src: [
				opt.VAR + '/client/lang/en.json',
				opt.VAR + '/client/lang/ru.json'
			],
			dest: opt.VAR + '/client/lang/ru.json'
		}]
	});

	this.run('copy', {
		files: [{
			expand: true,
			cwd: opt.VAR + '/client/lang',
			src: '*.json',
			dest: opt.BUILD + '/client/var/lang'
		}]
	});

};