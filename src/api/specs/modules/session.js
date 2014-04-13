

module.exports = {

	"GET session/user": {
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},


	"POST session/user": {
		"request": {
			"username:string{3,50}": "required",
			"password:string{6,50}": "required",
			"remember:boolean": "optional"
		},
		"response": [
			"id:decimal",
			"username:string",
			"email:string"
		]
	},


	"DELETE session/user": {
		"response": [
			"status:boolean"
		]
	}

};