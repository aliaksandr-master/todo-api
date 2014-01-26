"use strict";
module.exports = function(grunt){

    return {

        content_img: {

            options: {
                excludeEmpty: true
            },

            files: [
                {
                    expand: true,
                    cwd: "_src/content/",
                    src: [
                        '**/*.{png,jpg,jpeg,gif}'
                    ],
                    dest: "client/content"
                }
            ]
        }
    };
};