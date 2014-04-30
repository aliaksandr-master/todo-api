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

	'.getMany': {
		routes: [
			'get /todo/list/'
		],
		response: {
			statuses: [ 200, 404, 403, 401 ],
			data: stdResponse,
			limit: 255
		}
	},

	'.getOne': {
		routes: [
			'get /todo/list/(:id)'
		],
		request: {
			params: {
				'id:decimal': 'required'
			}
		},
		response: {
			statuses: [ 200, 404, 403, 401 ],
			data: stdResponse
		}
	},

	'.createOne': {
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
			statuses: [ 200, 400, 403, 401 ],
			data: stdResponse
		}
	},

	'.updateOne': {
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
			statuses: [ 200, 400, 403, 401 ],
			data: stdResponse
		}
	},

	'.deleteOne': {
		routes: [
			'delete /todo/list/(:id)/'
		],
		request: {
			params: {
				'id:decimal': 'required'
			}
		},
		response: {
			statuses: [ 200, 410, 403, 401 ]
		}
	}
};