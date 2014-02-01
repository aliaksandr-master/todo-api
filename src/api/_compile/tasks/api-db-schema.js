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

			var sourceScheme = {table:{},tables:[]};

			_.each(r.mysqldump.database.table_structure, function(table, tableCounter){
				sourceScheme.table[table.name] = {field:{},fields:[]};
				_.each(table.field, function(field){
					sourceScheme.table[table.name].fields.push(field.Field);
					var type = field.Type.replace(/^(\w+)(?:\((\d+)\))?/, '$1');
					var length = field.Type.replace(/^(\w+)(?:\((\d+)\))?/, '$2');
					var dataType;
					switch(type){
						case 'int':
						case 'tinyint':
						case 'smallint':
						case 'mediumint':
						case 'bigint':
						case 'float':
						case 'double':
						case 'decimal':
							dataType = 'numeric';
							break;
						case 'date':
						case 'datetime':
						case 'timestamp':
						case 'time':
						case 'year':
							dataType = 'date';
							break;
						default:
							dataType = 'string';
							break;
					}
					sourceScheme.table[table.name].field[field.Field] = {
						'category': dataType,
						'type': type,
						'length': length,
						'default': field.Default,
						'null': field.Null,
						'pk' : field.Key === 'PRI',
						'ai' : field.Extra === 'auto_increment'
					};
				});
				sourceScheme.tables.push(table.name);
				grunt.log.writeln('#'+(tableCounter+1)+' '+table.name+' '+JSON.stringify(sourceScheme.table[table.name].fields));
			});

			var verboseScheme = r.mysqldump.database;

			var file;

			// verbose save
			file = config.dest + 'db.' + dbRefName + '.scheme.verbose.json';
			grunt.file.write(file, JSON.stringify(verboseScheme, null, config.options.beauty ? 4 : 0));
			grunt.log.ok(file, ' was created.');

			// source save
			file = config.dest + 'db.' + dbRefName + '.scheme.source.json';
			grunt.file.write(file, JSON.stringify(sourceScheme, null, config.options.beauty ? 4 : 0));
			grunt.log.ok(file, ' was created.');


			// parsed compile
			var parsedScheme = {};
			_.each(sourceScheme.table, function(data, name){
				parsedScheme[name] = data.field;
			});

			// parsed save
			file = config.dest + 'db.' + dbRefName + '.scheme.parsed.json';
			grunt.file.write(file, JSON.stringify(parsedScheme, null, config.options.beauty ? 4 : 0));
			grunt.log.ok(file, ' was created.');
		});
	};


};