'use strict';

module.exports = function(grunt){

    var _ = require('underscore');

    return function(){

        var options = {
            root: "_src/client/lang",
            config: "_src/client/lang/lang.json",
            dest: 'server/_generated_/'
        };

        var config = grunt.file.readJSON(options.config);

        var langs = {};

        _.each(config.lang, function(_fullLang, lang){
            var fs = [];

            var index = grunt.file.readJSON(options.root + '/' + lang + '/index.json');

            fs = grunt.file.expand({cwd: options.root + '/' + lang + '/translates'}, ['*.json']);

            _.each(fs, function(filePath){
                var json = grunt.file.readJSON(options.root + '/' + lang + '/translates/' + filePath);
                var name = filePath.split(/[\\\/]+/).pop().replace(/\.json$/, '');

                var data = {};
                data[name] = json;
                _.extend(index, data);

            });
            langs[lang] = index;
        });

        _.each(langs, function(data, lang){
            data = _.extend({}, langs[config.default], data);
            var file = options.dest + 'lang.' + lang + '.json';
            grunt.file.write(file, JSON.stringify(data, null, 4));
            grunt.log.ok('file: "' + file + '" was created');
        })
    };


};