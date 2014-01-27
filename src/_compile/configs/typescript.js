"use strict";
module.exports = function(grunt){

	return {
		compile: {
			expand: true,
			cwd: 'src/client/',
			src: [
				'*.ts',
				'**/*.ts'
			],
			dest: 'client/',
			ext: '.js',
			options: {
				module: 'amd', //or 'commonjs'
				target: 'es5', //or 'es3'
				sourcemap: false,
				declaration: true
			}
		}
	};
};