'use strict';

var response = {
	'id:decimal': null,
	'username:string': null,
	'email:string': null
};

module.exports = {

	controller: 'SessionUserController',

	statuses: [],

	'.getOne': {
		statuses: [200, 404],
		response: {
			data: response
		}
	},

	'.createOne': {
		statuses: [201, 400],
		request: {
			body: {
				'username:string{3,50}': 'required',
				'password:string{6,50}': 'required',
				'remember:boolean': 'optional'
			}
		},
		response: {
			data: response
		}
	},

	'.deleteOne': {
		statuses: [200, 410]
	}

//	'.test': {
//		response: {
//
//		},
//		request: {
//			'username:string{3,50}': 'required',
//			'password:string{6,50}': 'required',
//			'data:object': {
//				'username:string{3,50}': 'required',
//				'password:string{6,50}': 'required',
//				'data:array': {
//					'username:string{3,50}': 'required',
//					'password:string{6,50}': 'required',
//					'data:object': {
//						'username:string{3,50}': 'required',
//						'password:string{6,50}': 'required'
//					}
//				}
//			}
//		}
//	}

};