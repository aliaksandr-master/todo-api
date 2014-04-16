'use strict';

module.exports = function(grunt){

    var _ = require('lodash');
	var taskUtils = require('./_utils');

    return function(){
        _.each(this.data.files, function(fileObject){
            var array = grunt.file.expandMapping(fileObject.src || [], fileObject.dest, _.pick(fileObject, ["flatten", "expand", "ext", "rename", "cwd"]));

            _.each(array, function(data){
                if(!grunt.file.isFile(data.dest)) {
                    grunt.file.copy(data.src, data.dest);
					taskUtils.logFileOk(data.dest);
                }
            });
        });
    };
};