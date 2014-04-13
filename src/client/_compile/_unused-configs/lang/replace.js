"use strict";
module.exports = function(grunt, options){

    var _ = require('lodash');

    return {

        lang_en:{
            overwrite: true,
            src: [
                '_temp_/en/templates/test.lang.hbs'
            ],
            replacements: [
                {
                    from: /\{\{t\s+(?:["']\s*([\w]{2})\s*["']\s+)?(?:\s*['"]\s*([^'"]+)\s*['"]\s*)?\}\}/g,
                    to: function($0, word, all, matches){
                        console.log(matches);
                        return $0;
                    }
                }
            ]
        }

    };

};