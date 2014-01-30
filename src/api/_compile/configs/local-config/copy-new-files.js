"use strict";
module.exports = function(grunt){

    return {
		'api-local-config': {
            options: {},
            files: [
                {
                    cwd: global.SRC + "/api/config-source",
                    src: [
                        "database.json"
                    ],
                    dest: global.LOCAL + "/_local/"
                }
            ]
        }
    };
};