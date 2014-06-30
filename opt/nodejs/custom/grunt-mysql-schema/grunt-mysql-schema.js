"use strict";

module.exports = function(grunt){

	grunt.task.registerMultiTask('MySQLDbSchema', function () {

		var _ = require('lodash');
		var shell = require("shelljs");
		var xml = require('xml2json');
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({
			verboseDir: '',
			beautify: false
		});

		fileProcessor.configure({
			readFile: function (fpath) {
				var connection = grunt.file.readJSON(fpath);
				var command = 'mysqldump -u {username} -h {hostname} --password="{password}" {database} --no-data --xml';
				return command.replace(/\{([^\}]+)\}/g, function (w, name) {
					return connection[name];
				});
			},
			beautifyJSON: options.beautify
		});

		fileProcessor.each(function (fpath, command) {

			var shellResult = shell.exec(command, { silent: true }).output;

			var dumpJSON = {};

			shellResult = shellResult.replace(/^Warning\s*:[^\n]+\n/gi, '');

			try {
				dumpJSON = xml.toJson(shellResult, {
					object: true,
					reversible: false,
					coerce: true,
					sanitize: true,
					trim: true,
					arrayNotation: false
				});
			} catch (e) {
				grunt.fail.fatal(shellResult);
				return {};
			}

			var sourceScheme = {table:{},tables:[]};

			var dbName = dumpJSON.mysqldump.database.name;

			if (!_.isArray(dumpJSON.mysqldump.database.table_structure)) {
				dumpJSON.mysqldump.database.table_structure = [dumpJSON.mysqldump.database.table_structure];
			}

			if (options.verboseRaw) {
				grunt.file.write(options.verboseRaw.replace(/\/?$/, '/') + require('path').basename(this.dest), JSON.stringify(dumpJSON, null, 4));
			}

			_.each(dumpJSON.mysqldump.database.table_structure, function(table, tableCounter){

				sourceScheme.table[table.name] = {
					field: {},
					fields: []
				};

				_.each(table.field, function (field) {
					var dataType,
						attr = field.Type.split(/[^\d\w]+/),
						type = attr.shift(),
						length = /^\d+$/.test(attr[0]||'') ? attr.shift() : undefined;

					sourceScheme.table[table.name].fields.push(field.Field);

					switch (type) {
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
						'name': field.Field,
						'category': dataType,
						'type': type,
						'length': length,
						'attr': attr,
						'default': field.Default,
						'null': field.Null !== 'NO',
						'relation': /_id$/.test(field.Field) ? {table: field.Field.replace(/_id$/, ''), field: 'id'} : null,
						'pk' : field.Key === 'PRI',
						'ai' : field.Extra === 'auto_increment',
						'comment': field.Comment || null/*,
						'src': field*/
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