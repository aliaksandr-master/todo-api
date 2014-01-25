'use strict';

module.exports = function(grunt){

	return function(){

		var config = {
			options: {
				beauty: true,
				verbose: false
			},
			db: {
				host: 'localhost',
				user: 'me',
				pass: '123123',
				name: 'listslider'
			},
			dest: 'server/_generated_/db.schema.json'
		};

		var parser = require('xml2json');
		var _ = require('underscore');
		var shell = require("shelljs");

		var r = shell.exec('mysqldump -u '+config.db.user+' -h '+config.db.host+' --no-data --password='+config.db.pass+' '+config.db.name+' --xml', {silent: true}).output;

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

		grunt.file.write(config.dest, r);
		grunt.log.ok(config.dest, ' was created.');
	};


};