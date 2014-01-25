'use strict';

module.exports = function(grunt){

    var _ = require('underscore');

    var config = {
        files: [
            {
                expand: true,
                cwd: "_src/server/_config/",
                src: "database.php",
                dest: "server/application/config/",
                by: "_local/db.json"
            }
        ]
    };

    return function(){
        var json2php = require("./../../../_src/grunt/utils.js").json2phpArray;

        console.log(json2php);

        _.each(config.files, function(fileObject){
            var array = grunt.file.expandMapping(fileObject.src || [], fileObject.dest, _.pick(fileObject, ["flatten", "expand", "ext", "rename", "cwd"]));

            var json = grunt.file.readJSON(fileObject.by);

            _.each(array, function(data){
                var content = grunt.file.read(data.src);
                var php_array = json2php(json);

                content = content.replace("/*{{PLACE HERE}}*/", "$config=" + php_array + ";");

                grunt.file.write(data.dest, content);

                grunt.log.ok('File ' + data.dest + ' was successfully created!');
            });
        });
    };
};