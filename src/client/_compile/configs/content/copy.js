"use strict";
module.exports = function(grunt){

    return {

        'client-content-img': {

            options: {
                excludeEmpty: true
            },

            files: [
                {
                    expand: true,
                    cwd: this.SRC + "/client/content/",
                    src: [
                        '**/*.{png,jpg,jpeg,gif,svg}'
                    ],
                    dest: this.BUILD + "/client/content/"
                }
            ]
        }
    };
};