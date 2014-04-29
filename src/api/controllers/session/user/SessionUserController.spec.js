"use strict";

var response = {
	"id:decimal": null,
	"username:string": null,
	"email:string": null
};

module.exports = {

	"> getOne": {
		response: response
	},

	"> createOne": {
		request: {
			"username:string{3,50}": "required",
			"password:string{6,50}": "required",
			"remember:boolean": "optional"
		},
		response: response
	},

	"> deleteOne": {},

//	"> test": {
//		response: {
//
//		},
//		request: {
//			"username:string{3,50}": "required",
//			"password:string{6,50}": "required",
//			"data:object": {
//				"username:string{3,50}": "required",
//				"password:string{6,50}": "required",
//				"data:array": {
//					"username:string{3,50}": "required",
//					"password:string{6,50}": "required",
//					"data:object": {
//						"username:string{3,50}": "required",
//						"password:string{6,50}": "required"
//					}
//				}
//			}
//		}
//	}

};