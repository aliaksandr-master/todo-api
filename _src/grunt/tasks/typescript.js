module.exports = function(grunt){

	return {
		compile2temp: {
			expand: true,
			cwd: '_src/client/',
			src: [
				'*.ts',
				'**/*.ts'
			],
			dest: 'temp/',
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