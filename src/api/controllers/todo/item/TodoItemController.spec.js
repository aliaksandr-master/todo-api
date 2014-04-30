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

	access: {
		need_login: true,
		only_owner: true
	},

	statuses: [ 403, 401 ],

	'.getOne': {
		statuses: [ 200, 404 ],
		routes: [
			'get /todo/list/(:listId)/item/(:itemId)/'
		],
		request: {
			params: {
				'listId:decimal': 'required',
				'itemId:decimal': 'required'
			}
		},
		response: {
			data: stdResponse
		}
	},

	'.getMany': {
		routes: [
			'get /todo/list/(:listId)/item/'
		],
		statuses: [ 200, 404 ],
		request: {
			params: {
				'listId:decimal': 'required'
			}
		},
		'response < 255': {
			data: stdResponse
		}
	},

	'.createOne': {
		routes: [
			'post /todo/list/(:listId)/item/'
		],
		statuses: [ 201, 400 ],
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
			data: stdResponse
		}
	},

	'.updateOne': {
		routes: [
			'put /todo/list/(:listId)/item/(:itemId)/'
		],
		statuses: [ 200, 400 ],
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
			data: stdResponse
		}
	},

	'.deleteOne': {
		routes: [
			'delete /todo/list/(:listId)/item/(:itemId)/'
		],
		statuses: [ 200, 410 ],
		request: {
			params: {
				'listId:decimal': 'required',
				'itemId:decimal': 'required'
			}
		}
	}
};