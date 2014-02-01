"use strict";

(function(){

	var _ = require('underscore');

	function db (){

	}

	function Table (name) {
		this._name = name;
		this.fields = [];
	}

	Table.prototype = {

		Field: function (name) {
			var field;

			field = new TableField(this);

			field.name(name);

			return field;
		},

		Relation: function (table, name) {
			var rel;

			rel = new RelationTableField(this);

			rel.table(table);
			rel.name(name);

			this.fields.push(rel);

			return rel;
		},

		name: function(name){
			if (name) {
				this._name = name;
			}
		}
	};

	function TableField (table) {
		this._table = table;
		this._attrs = {};
	}

	TableField.prototype = {

		Field: function () {
			return this._table.Field.apply(this._table, arguments);
		},

		Relation: function () {
			return this._table.Relation.apply(this._table, arguments);
		},

		_types: ['int', ''],

		type: function () {

		},

		varchar: function () {

		},

		pk: function () {
			this._attrs.pk = true;
		},

		ua: function () {
			this._attrs.ua = true;
		},

		nn: function () {
			this._attrs.nn = true;
		},

		defaults: function () {

		},

		name: function(name){
			if (name) {
				this._name = name;
			}
		}

	};

	function RelationTableField  (table) {
		this._table = table;
	}

	RelationTableField.prototype = {

		Field: function () {
			return this._table.Field.apply(this._table, arguments);
		},

		Relation: function () {
			return this._table.Relation.apply(this._table, arguments);
		},

		table: function (name) {
			if (name) {
				this._relation = name;
			}
		},

		name: function(name){
			if (name) {
				this._name = name;
			}
		}

	};

	module.exports = TableField;
})();