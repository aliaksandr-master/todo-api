"use strict";

module.exports = function(grunt){

	grunt.task.registerMultiTask('copy-new-files', function(){

		var _ = require('lodash');
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

        _.each(this.data.files, function(fileObject){
            var array = grunt.file.expandMapping(fileObject.src || [], fileObject.dest, _.pick(fileObject, ["flatten", "expand", "ext", "rename", "cwd"]));

            _.each(array, function(data){
                if(!grunt.file.isFile(data.dest)) {
                    grunt.file.copy(data.src, data.dest);
					logFileOk(data.dest);
                }
            });
        });
    });
};