"use strict";

module.exports = function(grunt){

	grunt.task.registerMultiTask('mysql-schema', function () {

		var _ = require('lodash');
		var shell = require("shelljs");
		var parser = require('xml2json');
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

		var options = this.options({
			connection: {
				username: '',
				hostname: '',
				password: '',
				database: ''
			},
			beauty:  false,
			verbose: false,
			trace: false,
			sourceJSON: false,
			outputJSON: false
		});

		if (_.isString(options.connection)) {
			options.connection = require(options.connection);
		}

		var r = shell.exec(
				'mysqldump -u ' +
					options.connection.username +
				' -h ' +
					options.connection.hostname +
				' --no-data --password=' +
					options.connection.password +
				' ' +
					options.connection.database +
				' --xml',
			{silent: true}
		).output;

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
			if (options.trace) {
				grunt.log.writeln('#'+(tableCounter+1)+' '+table.name+' '+JSON.stringify(sourceScheme.table[table.name].fields));
			}
		});

		var verboseScheme = r.mysqldump.database;

		if (options.sourceJSON) {
			grunt.file.write(options.sourceJSON, JSON.stringify(verboseScheme, null, options.beauty ? 4 : 0));
			logFileOk(options.sourceJSON);
		}

		// parsed compile
		var parsedScheme = {};
		_.each(sourceScheme.table, function(data, name){
			parsedScheme[name] = data.field;
		});

		if (options.outputJSON) {
			grunt.file.write(options.outputJSON, JSON.stringify(parsedScheme, null, options.beauty ? 4 : 0));
			logFileOk(options.outputJSON);
		}
	});


};