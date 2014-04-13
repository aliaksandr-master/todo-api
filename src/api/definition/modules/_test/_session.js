"use strict";

var stdResponse = [
	"id:decimal",
	"username:string",
	"email:string"
];

module.exports = {

	"options /session/user": {
		a: 1,
		b: 2,
		c: {
			ca: 1,
			cb: 2,
			cd: null
		}
	},

	"options": {
		a: 2,
		c: {
			cc: 3,
			ca: 0,
			cd: {
				hello: 1
			}
		}
	},

	"resource /user/<id:^$>": {

	},

	"resource /user/?<param:^hello$>": {
		":": {

		},

		"get": {
			"request": {
				"body": {

				},
				"query": {

				},
				"arguments": {

				}
			}
		}

	},

	"resource /session/user": {

		get: {
			response: stdResponse
		},

		post: {
			request: {
				"username:string{3,50}": "required",
				"password:string{6,50}": "required",
				"remember:boolean": "optional"
			},
			response: stdResponse
		},

		delete: {
			response: [
				"status:boolean"
			]
		}

	}
};