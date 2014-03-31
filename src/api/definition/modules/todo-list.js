

module.exports = {
	"GET todo": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"response < 255": [
			"id:decimal",
			"link:string",
			"name:string",
			"is_shared:boolean",
			"sort_order:decimal"
		]
	},
	"GET todo/$id": {
		"request": {
			"$id:decimal": "required"
		},
		"response": [
			"id:decimal",
			"link:string",
			"name:string",
			"is_shared:boolean",
			"sort_order:decimal"
		]
	},

	"POST todo": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"name:string": "optional",
			"is_shared:boolean": "optional",
			"sort_order:decimal": "optional"
		},
		"response": [
			"id:decimal",
			"link:string",
			"name:string",
			"is_shared:boolean",
			"sort_order:decimal"
		]
	},

	"PUT todo/$id": {
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
		"response": [
			"id:decimal",
			"link:string",
			"name:string",
			"is_shared:boolean",
			"sort_order:decimal"
		]
	},

	"DELETE todo/$todo_id": {
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