module.exports = function(grunt){

	return {
		options: this._.extend(grunt.file.readJSON('.jshintrc'),{
			globals: {
				define: true,
				require: true,
				requirejs: true,
				console: true
			}
		}),
		'check_src' : {
			src: [
				'_src/client/js/**/*.js',
				'_src/client/js/*.js'
			]
		},
		gruntfile: {
			src: [
				'Gruntfile.js'
			]
		}
	};
};