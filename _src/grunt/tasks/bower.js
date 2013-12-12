module.exports = function(grunt){

	return {
		install: {
			options: {
				install: true,
				verbose: false,
				layout: 'byType',
				//					copy: true,
				targetDir: './temp/bower_components',
				cleanBowerDir: false,
				cleanTargetDir: true
			}
		}
	};
};