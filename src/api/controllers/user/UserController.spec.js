'use strict';

var stdResponse = [
	'id:decimal',
	'username:string'
];

module.exports = {

	controller: 'UserController',

	'.getMany': {
		routes: [
			'get /user/'
		],
		statuses: [200, 404],
		'response < 255': {
			data: stdResponse
		}
	},

	'.getOne': {
		routes: [
			'get /user/(:id)/'
		],
		statuses: [200, 404],
		request: {
			params: {
				'id:decimal': 'required'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.createOne': {
		routes: [
			'post /user/'
		],
		statuses: [200, 400],
		request: {
			body: {
				'username:string{3,50}': 'required|alpha_dash|unique',
				'email:string': 'required|valid_email|unique',
				'password:string{6,50}': 'required|matches["confirm_password"]',
				'confirm_password:string{6,50}': 'required|matches["password"]'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.updateOne': {
		routes: [
			'put /user/(:id)/'
		],
		statuses: [200, 400, 403, 401],
		access: {
			need_login: true,
			only_owner: true
		},
		request: {
			params: {
				'id:decimal': 'optional|exists'
			},
			body: {
				'username:string': 'optional|need["password_old"]|unique',
				'email:string': 'required|valid_email|unique|need["password_old"]',
				'password_old:string': 'optional|valid_password',
				'password_new:string': 'optional|matches["password_new_confirm"]|need["password_old"]',
				'password_new_confirm:string': 'optional|matches["password_new"]|need["password_old"]'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.deleteOne': {
		routes: [
			'delete /user/(:id)/'
		],
		statuses: [200, 410, 401, 403],
		access: {
			need_login: true,
			only_owner: true
		},
		request: {
			params: {
				'id:decimal': 'required'
			}
		}
	}
};