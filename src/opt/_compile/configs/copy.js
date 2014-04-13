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
                },
                {
                    expand: true,
                    cwd: "src/opt/helpers",
                    src: [
                        "*",
                        "**/*"
                    ],
                    dest: "build/opt/helpers"
                }
            ]
        }
    };
};