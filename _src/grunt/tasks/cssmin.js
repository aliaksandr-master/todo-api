module.exports = function(grunt){

	return {
		dev: {
			files: {
				'client/css/styles.min.css':[
					'_src/client/vendor/bootstrap/custom/css/bootstrap.min.css',
					'bower_components/jgrowl/jquery.jgrowl.css',
					'_src/client/styles/styles.css'
				]
			}
		}
	};
};