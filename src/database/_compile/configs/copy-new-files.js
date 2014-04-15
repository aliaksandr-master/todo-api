"use strict";
module.exports = function(grunt){

    return {
		'db-config': {
            options: {},
            files: [
                {
                    cwd: global.SRC + "/database/_config",
                    src: [
                        "database.json"
                    ],
                    dest: global.LOCAL
                }
            ]
        }
    };
};