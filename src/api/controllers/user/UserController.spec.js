"use strict";

var stdResponse = [
	"id:decimal", "username:string", "email:string"
];

module.exports = {

	"> getMany": {
		"response < 255": stdResponse
	},

	"> getOne": {
		"request": {
			"$id:decimal": "required"
		},
		"response": stdResponse
	},

	"> createOne": {
		"request": {
			"username:string{3,50}": "required|alpha_dash|unique",
			"email:string": "required|valid_email|unique",
			"password:string{6,50}": "required|matches['confirm_password']",
			"confirm_password:string{6,50}": "required|matches['password']"
		},
		"response": stdResponse
	},

	"> updateOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$id:decimal": "optional|exists",
			"username:string": "optional|need['password_old']|unique",
			"email:string": "required|valid_email|unique|need['password_old']",
			"password_old:string": "optional|valid_password",
			"password_new:string": "optional|matches['password_new_confirm']|need['password_old']",
			"password_new_confirm:string": "optional|matches['password_new']|need['password_old']"
		},
		"response": stdResponse
	},

	"> deleteOne": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request": {
			"$id:decimal": "required"
		},
		"response": [
			"status:boolean"
		]
	}
};