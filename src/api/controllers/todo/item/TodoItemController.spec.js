"use strict";

var stdResponse = [
	"id:decimal",
	"todo_id:decimal",
	"sort_order:decimal",
	"name:string",
	"date_create:string",
	"is_active:boolean"
];

module.exports = {

	"> getOne": {
		"request": {
			"$todo_id:decimal": "required",
			"$id:decimal": "required"
		},
		"response": stdResponse
	},

	"> getMany": {
		"handler": "todo#item",
		"request": {
			"$todo_id:decimal": "required"
		},
		"response < 255": stdResponse
	},

	"> createOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$todo_id:decimal": "required",
			"name:string": "optional",
			"sort_order:decimal": "optional",
			"is_active:boolean": "optional"
		},
		"response": stdResponse
	},

	"> updateOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$todo_id:decimal": "required",
			"$id:decimal": "required",
			"name:string": "optional",
			"sort_order:decimal": "optional",
			"is_active:boolean": "optional"
		},
		"response": stdResponse
	},

	"> deleteOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$todo_id:decimal": "required",
			"$id:decimal": "required"
		},
		"response": [
			"status:boolean"
		]
	}
};