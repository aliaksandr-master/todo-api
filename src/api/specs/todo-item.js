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
	"GET todo/$todo_id/item": {
		"handler": "todo#item",
		"request": {
			"$todo_id:decimal": "required"
		},
		"response < 255": stdResponse
	},
	"GET todo/$todo_id/item/$id": {
		"request": {
			"$todo_id:decimal": "required",
			"$id:decimal": "required"
		},
		"response": stdResponse
	},
	"POST todo/$todo_id/item": {
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
	"PUT todo/$todo_id/item/$id": {
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
	"DELETE todo/$todo_id/item/$id": {
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