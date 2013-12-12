module.exports = function(grunt){

	return {
		compile: {
			options: {
				namespace: 'JST',
				amd: false
			},
			files: [
				{
					expand: true,
					cwd: "_src/client/",
					src: ['templates/**/*.hbs'],
					dest: 'client/',
					ext: '.js'
				}
			]
		}
	};
};