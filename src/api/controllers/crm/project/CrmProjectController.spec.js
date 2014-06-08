'use strict';

var response = {
	'id:decimal': null,
	'name:string': null
};

var request = {
	'name:string': 'required'
};

module.exports = {

	routeRootUrl: '/crm/project/',

	access: {
		need_login: true,
		only_owner: true
	},

	'.getOne': {
		routes: [
			'get (:id)'
		],
		request: {
			params: {
				'id:decimal': 'required'
			}
		},
		response: {
			statuses: [200, 404],
			data: response
		}
	},

	'.getMany': {
		routes: [
			'get'
		],
		response: {
			statuses: [200, 404],
			data: response,
			limit: 255
		}
	},

	'.createOne': {
		routes: [
			'post'
		],
		request: {
			body: request
		},
		response: {
			statuses: [201, 400],
			data: response
		}
	},

	'.updateOne': {
		routes: [
			'put (:id)'
		],
		request: {
			params: {
				'id:decimal': 'required'
			},
			body: request
		},
		response: {
			statuses: [200, 400],
			data: response
		}
	},

	'.deleteOne': {
		routes: [
			'delete (:id)'
		],
		request: {
			params: {
				'id:decimal': 'required'
			}
		},
		response: {
			statuses: [200, 410]
		}
	}

};