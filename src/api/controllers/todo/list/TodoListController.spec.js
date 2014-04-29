"use strict";

var stdResponse = [
	"id:decimal", "link:string", "name:string", "is_shared:boolean", "sort_order:decimal"
];

module.exports = {

	"> getMany": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"response < 255": stdResponse
	},

	"> getOne": {
		"request": {
			"$id:decimal": "required"
		},
		"response": stdResponse
	},

	"> createOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"name:string": "optional",
			"is_shared:boolean": "optional",
			"sort_order:decimal": "optional"
		},
		"response": stdResponse
	},

	"> updateOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$id:decimal": "required",
			"name:string{1,40}": "optional",
			"is_shared:boolean": "optional",
			"sort_order:decimal{1,11}": "optional"
		},
		"response": stdResponse
	},

	"> deleteOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$todo_id:decimal{1,11}": "required"
		},
		"response": [
			"status:boolean"
		]
	}
};