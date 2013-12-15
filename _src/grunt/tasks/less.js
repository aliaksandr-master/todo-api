"use strict";
module.exports = function(grunt){

	return {
		compile: {
			options: {
				compress: false,
				cleancss: false,
				syncImport: false,
				dumpLineNumbers: false,
				ieCompat: true,
				sourceMap: false,
				relativeUrls: false,
				report: 'gzip',
				strictUnits: true,
				optimization: null,
				rootpath: '',
				paths: [
					'_src/client/styles'
				]
			},
			files: [
				{
					expand: true,
					cwd: "_src/client/styles",
					src: [
						'*.less',
						'pages/*.less',
					],
					dest: 'client/styles',
					ext: '.css'
				}
			]
		}
	};

};