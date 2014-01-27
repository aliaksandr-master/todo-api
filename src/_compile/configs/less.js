"use strict";
module.exports = function(grunt){

	return {
		compile: {
			options: {
				compress: false,
				cleancss: false,
				syncImport: true,
				dumpLineNumbers: false,
				ieCompat: true,
				sourceMap: false,
				relativeUrls: false,
//				report: 'gzip',
				strictUnits: true,
				strictImports: true,
				optimization: null,
				rootpath: '',
				paths: [
					'src/client'
				]
			},
			files: [
				{
					expand: true,
					cwd: "src/client/styles",
					src: [
						'*.less',
						'**/*.less'
					],
					dest: 'client/styles',
					ext: '.css'
				}
			]
		}
	};

};