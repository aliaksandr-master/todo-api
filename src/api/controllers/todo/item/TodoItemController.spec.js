'use strict';

var stdResponse = [
	'id:decimal',
	'todo_id:decimal',
	'sort_order:decimal',
	'name:string',
	'date_create:string',
	'is_active:boolean'
];

module.exports = {

	controller: 'TodoItemController',

	routeRootUrl: '/todo/list/(:listId)/item',

	access: {
		need_login: true,
		only_owner: true
	},

	'.getOne': {
		routes: [
			'get (:itemId)/'
		],
		request: {
			params: {
				'listId:decimal': 'required',
				'itemId:decimal': 'required'
			}
		},
		response: {
			statuses: [ 200, 404, 403, 401 ],
			data: stdResponse
		}
	},

	'.getMany': {
		routes: [
			'get'
		],
		request: {
			params: {
				'listId:decimal': 'required'
			}
		},
		response: {
			statuses: [ 200, 404, 403, 401 ],
			data: stdResponse,
			limit: 255
		}
	},

	'.createOne': {
		routes: [
			'post'
		],
		request: {
			params: {
				'listId:decimal': 'required'
			},
			body: {
				'name:string': 'optional',
				'sort_order:decimal': 'optional',
				'is_active:boolean': 'optional'
			}
		},
		response: {
			statuses: [ 201, 400, 403, 401 ],
			data: stdResponse
		}
	},

	'.updateOne': {
		routes: [
			'put (:itemId)/'
		],
		request: {
			params: {
				'listId:decimal': 'required',
				'itemId:decimal': 'required'
			},
			body: {
				'name:string': 'optional',
				'sort_order:decimal': 'optional',
				'is_active:boolean': 'optional'
			}
		},
		response: {
			statuses: [ 200, 400, 403, 401 ],
			data: stdResponse
		}
	},

	'.deleteOne': {
		routes: [
			'delete (:itemId)/'
		],
		request: {
			params: {
				'listId:decimal': 'required',
				'itemId:decimal': 'required'
			}
		},

		response: {
			statuses: [ 200, 410, 403, 401 ]
		}
	}
};