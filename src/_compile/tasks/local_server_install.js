'use strict';

module.exports = function(grunt){

    var _ = require('underscore');

    var config = {
        files: [
            {
                expand: true,
                cwd: "src/api/_config/",
                src: "database.php",
                dest: "build/api/config/",
                by: "./src/_env/local/configs/db.json"
            }
        ]
    };

    return function(){
        var json2php = require("./../../../src/_compile/utils.js").json2phpArray;

        _.each(config.files, function(fileObject){
            var array = grunt.file.expandMapping(fileObject.src || [], fileObject.dest, _.pick(fileObject, ["flatten", "expand", "ext", "rename", "cwd"]));

            var json = grunt.file.readJSON(fileObject.by);

            _.each(array, function(data){
                var content = grunt.file.read(data.src);
                var php_array = json2php(json);

                content = content.replace("/*{{PLACE HERE}}*/", "$db=" + php_array + ";");

                grunt.file.write(data.dest, content);

                grunt.log.ok('File ' + data.dest + ' was successfully created!');
            });
        });
    };
};