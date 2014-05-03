'use strict';

var response = {
	'id:decimal': null,
	'username:string': null,
	'email:string': null
};

module.exports = {

	controller: 'SessionUserController',

	routeRootUrl: '/session/user/',

	'.getOne': {
		routes: [
			'get'
		],
		response: {
			statuses: [200, 404],
			data: response
		}
	},

	'.createOne': {
		routes: [
			'post'
		],
		request: {
			body: {
				'username:string{3,50}': 'required',
				'password:string{6,50}': 'required',
				'remember:boolean': 'optional'
			}
		},
		response: {
			statuses: [201, 400],
			data: response
		}
	},

	'.deleteOne': {
		routes: [
			'delete'
		],
		response: {
			statuses: [200, 410]
		}
	}

//	'.test': {
//		routes: [
//			'get test/'
//		],
//		response: {
//			statuses: [200, 400],
//			data: {
//				'username:string{3,50}': 'required',
//				'password:string{6,50}': 'required',
//				'data:object': {
//					'username:string{3,50}': 'required',
//					'password:string{6,50}': 'required',
//					'data:array': {
//						'username:string{3,50}': 'required',
//						'password:string{6,50}': 'required',
//						'data:object': {
//							'username:string{3,50}': 'required',
//							'password:string{6,50}': 'required'
//						}
//					}
//				}
//			}
//		},
//		request: {
//			body: {
//				'username:string{3,50}': 'required',
//				'password:string{6,50}': 'required',
//				'data:object': {
//					nested: {
//						'username:string{3,50}': 'required',
//						'password:string{6,50}': 'required',
//						'data:array': {
//							limit: 123,
//							nested: {
//								'username:string{3,50}': 'required',
//								'password:string{6,50}': 'required',
//								'data:object': {
//									nested: {
//										'username:string{3,50}': 'required',
//										'password:string{6,50}': 'required'
//									}
//								}
//							}
//						}
//					}
//				}
//			}
//		}
//	}

};