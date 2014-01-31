'use strict';

module.exports = function(grunt){

	return function(){

		var configDb = grunt.file.readJSON(global.LOCAL+'/database.json');

		var config = {
			options: {
				beauty: true,
				verbose: false
			},
			dest: global.BUILD + '/api/var/'
		};

		var parser = require('xml2json');
		var _ = require('underscore');
		var shell = require("shelljs");

		_.each(configDb, function(db, dbRefName){
			var r = shell.exec('mysqldump -u '+db.username+' -h '+db.hostname+' --no-data --password='+db.password+' '+db.database+' --xml', {silent: true}).output;

			r = parser.toJson(r, {
				object: true,
				reversible: false,
				coerce: true,
				sanitize: true,
				trim: true,
				arrayNotation: false
			});

			var rr = {table:{},tables:[]};

			if(!config.options.verbose){
				_.each(r.mysqldump.database.table_structure, function(table, tableCounter){
					rr.table[table.name] = {field:{},fields:[]};
					_.each(table.field, function(field){
						rr.table[table.name].fields.push(field.Field);
						var type = field.Type.replace(/^(\w+)(?:\((\d+)\))?/, '$1');
						var length = field.Type.replace(/^(\w+)(?:\((\d+)\))?/, '$2');
						rr.table[table.name].field[field.Field] = {
							'type': type,
							'length': length,
							'null': field.Null,
							'pk' : field.Key === 'PRI',
							'ai' : field.Extra === 'auto_increment'
						};
					});
					rr.tables.push(table.name);
					grunt.log.writeln('#'+(tableCounter+1)+' '+table.name+' '+JSON.stringify(rr.table[table.name].fields));
				});
			} else {
				rr = r.mysqldump.database.table_structure;
			}

			r = JSON.stringify(rr, null, config.options.beauty ? 4 : 0);

			var file = config.dest + 'db.' + dbRefName + '.scheme.json';
			grunt.file.write(file, r);
			grunt.log.ok(file, ' was created.');
		});
	};


};