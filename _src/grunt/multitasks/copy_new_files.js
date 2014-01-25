'use strict';

module.exports = function(grunt){

    var _ = require('underscore');

    return function(){
        _.each(this.data.files, function(fileObject){
            var array = grunt.file.expandMapping(fileObject.src || [], fileObject.dest, _.pick(fileObject, ["flatten", "expand", "ext", "rename", "cwd"]));

            _.each(array, function(data){
                if(!grunt.file.isFile(data.dest)) {
                    grunt.file.copy(data.src, data.dest);
                    grunt.log.ok('File ' + data.src + ' was successfully copied to ' + data.dest);
                }
            })
        });
    };
};