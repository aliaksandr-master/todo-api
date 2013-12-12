module.exports = function(grunt){

	return {
		compile2temp: {
			expand: true,
			cwd: '_src/client',
			src: [
				'*.coffee',
				'**/*.coffee'
			],
			dest: 'temp/',
			ext: '.js'
		}
	};
};