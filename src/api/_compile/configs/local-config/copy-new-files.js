"use strict";
module.exports = function(grunt){

    return {
		'api-local-config': {
            options: {},

            files: [
                {
                    cwd: "src/api/config",
                    src: [
                        "database.json"
                    ],
                    dest: "_local/"
                }
            ]
        }
    };
};