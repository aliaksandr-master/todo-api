module.exports = function(grunt){

	return {
		options: {
			livereload: this.liveReload.port
		},
		dev: {
			files: [
				'_src/client/**/*.js',
				'_src/client/**/*.css',
				'_src/client/**/*.hbs'
			],
			tasks: 'watched'
		}
	};
};