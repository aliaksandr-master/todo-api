"use strict";
module.exports = function(grunt){

    return {

        'build-opt': {

            options: {
                excludeEmpty: true
            },

            files: [
                {
                    expand: true,
                    cwd: "src/opt/codeigniter",
                    src: [
                        "*",
                        "**/*"
                    ],
                    dest: "build/opt/codeigniter"
                }
            ]
        }
    };
};