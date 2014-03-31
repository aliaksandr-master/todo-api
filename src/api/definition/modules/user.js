

module.exports = {

	"GET user": {
		"response < 255": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},

	"GET user/$id": {
		"request": {
			"$id:decimal": "required"
		},
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},

	"DELETE user/$id": {
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
	},

	"PUT user/$id": {
		"access": {
			"need_login": true,
			"only_owner": true
		},
		"request" : {
			"$id:decimal": "optional|exists",
			"username:string": "optional|need['password_old']|unique",
			"email:string": "required|valid_email|unique|need['password_old']",
			"password_old:string": "optional|valid_password",
			"password_new:string": "optional|matches['password_new_confirm']|need['password_old']",
			"password_new_confirm:string": "optional|matches['password_new']|need['password_old']"
		},
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},


	"POST user": {
		"request": {
			"username:string{3,50}": "required|alpha_dash|unique",
			"email:string": "required|valid_email|unique",
			"password:string{6,50}": "required|matches['confirm_password']",
			"confirm_password:string{6,50}": "required|matches['password']"
		},
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},


	"GET user/current": {
        "access": {
            "need_login": false
        },
        "response": [
            "id:decimal",
            "username:string",
            "email:string"
        ]
    },


	"POST user/login": {
		"request": {
			"username:string{3,50}": "required",
			"password:string{6,50}": "required",
			"remember:boolean": "optional"
		},
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		],
		"errors": {
			"password": "incorrect"
		}
	},

	"GET user/logout": {
		"response": [
			"status:boolean"
		]
	}
};