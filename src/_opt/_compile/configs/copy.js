"use strict";
module.exports = function(grunt){

    return {

        build_opt: {

            options: {
                excludeEmpty: true
            },

            files: [
                {
                    expand: true,
                    cwd: "src/_opt/codeigniter",
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