"use strict";
module.exports = function(grunt){

    return {
        options: {

        },
        local: {
            options: {

            },

            files: [
                {
                    cwd: "_src/local/",
                    src: [
                        "*.json",
                        "**/*.json"
                    ],
                    dest: "_local/"
                }
            ]
        }
    };
};