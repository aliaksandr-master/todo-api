"use strict";

module.exports = function () {
	var opt = this;

	this.run('symlink', {
		options: {
			overwrite: true,
			force: true
		},
		target: 'opt',
		link: 'path/to/link'
	});
};