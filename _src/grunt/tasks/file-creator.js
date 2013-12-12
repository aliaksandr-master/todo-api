module.exports = function(grunt){

	return {
		livereload: {
			"client/livereload.js": function(fs, fd, done){
				fs.writeSync(fd, ' ');
				done();
			}
		}
	};
};