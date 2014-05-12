"use strict";

var grunt = require('grunt');

module.exports = function (fpath, msgEnd, msgBegin) {
	msgBegin = msgBegin == null ? 'File ' : msgBegin.trim() + ' ';
	msgEnd = msgEnd == null ? ' created' : ' ' + msgEnd.trim();

	fpath = fpath.replace(process.cwd(), '').replace(/^[\/]+/, '');

	grunt.log.ok(msgBegin + fpath + msgEnd);
};