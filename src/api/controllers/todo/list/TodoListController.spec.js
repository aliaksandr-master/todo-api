'use strict';

var stdResponse = [
	'id:decimal', 'link:string', 'name:string', 'is_shared:boolean', 'sort_order:decimal'
];

module.exports = {

	controller: 'TodoListController',

	access: {
		need_login: true,
		only_owner: true
	},

	statuses: [
		403, 401
	],

	'.getMany': {
		routes: [
			'get /todo/list/'
		],
		statuses: [200, 404],
		'response < 255': {
			data: stdResponse
		}
	},

	'.getOne': {
		routes: [
			'get /todo/list/(:id)'
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
		statuses: [200, 400],
		routes: [
			'post /todo/list/'
		],
		request: {
			body: {
				'name:string': 'optional',
				'is_shared:boolean': 'optional',
				'sort_order:decimal': 'optional'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.updateOne': {
		statuses: [200, 400],
		routes: [
			'put /todo/list/(:id)'
		],
		request: {
			params: {
				'id:decimal': 'required'
			},
			body: {
				'name:string{1,40}': 'optional',
				'is_shared:boolean': 'optional',
				'sort_order:decimal{1,11}': 'optional'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.deleteOne': {
		routes: [
			'delete /todo/list/(:id)/'
		],
		statuses: [200, 410],
		request: {
			params: {
				'id:decimal': 'required'
			}
		}
	}
};