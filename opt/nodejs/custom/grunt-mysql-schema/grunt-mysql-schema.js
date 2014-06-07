"use strict";

module.exports = function(grunt){

	grunt.task.registerMultiTask('MySQLDbSchema', function () {

		var _ = require('lodash');
		var shell = require("shelljs");
		var xml = require('xml2json');
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({
			beautify: false
		});

		fileProcessor.configure({
			readFile: function (fpath) {
				var connection = grunt.file.readJSON(fpath);
				var command = 'mysqldump -u {username} -h {hostname} --no-data --password="{password}" {database} --xml';
				return command.replace(/\{([^\}]+)\}/g, function (w, name) {
					return connection[name];
				});
			},
			beautifyJSON: options.beautify
		});

		fileProcessor.each(function (fpath, command) {

			var shellResult = shell.exec(command, { silent: true }).output;

			var dumpJSON = xml.toJson(shellResult, {
				object: true,
				reversible: false,
				coerce: true,
				sanitize: true,
				trim: true,
				arrayNotation: false
			});

			var sourceScheme = {table:{},tables:[]};

			var dbName = dumpJSON.mysqldump.database.name;

			if (!_.isArray(dumpJSON.mysqldump.database.table_structure)) {
				dumpJSON.mysqldump.database.table_structure = [dumpJSON.mysqldump.database.table_structure];
			}
			_.each(dumpJSON.mysqldump.database.table_structure, function(table, tableCounter){

				sourceScheme.table[table.name] = {
					field: {},
					fields: []
				};

				_.each(table.field, function (field) {
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
				grunt.log.writeln('   ' + dbName + ': '+table.name+' [' + sourceScheme.table[table.name].fields.join(', ') + ']');
			});

			// parsed compile
			var parsedScheme = {};
			_.each(sourceScheme.table, function(data, name){
				parsedScheme[name] = data.field;
			});

			return parsedScheme;
		});
	});


};