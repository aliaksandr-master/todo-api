"use strict";

module.exports = {
	controller: 'TestCrudController',

	routeRootUrl: '/test/crud/',

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
			data: [
				'id:decimal',
				'some_text:text',
				'some_string:string',
				'some_bool:boolean'
			]
		}
	},

	'.getMany': {
		routes: [
			'get'
		],
		request: {},
		response: {
			statuses: [200, 404],
			data: [
				'id:decimal',
				'some_text:text',
				'some_string:string',
				'some_bool:boolean'
			],
			limit: 255
		}
	},

	'.createOne': {
		routes: [
			'post'
		],
		request: {
			body: {
				'some_text:text': 'required',
				'some_string:string': 'required',
				'some_bool:boolean': 'required'
			}
		},
		response: {
			statuses: [201, 400],
			data: [
				'id:decimal',
				'some_text:text',
				'some_string:string',
				'some_bool:boolean'
			]
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
			body: {
				'some_text:text': 'required',
				'some_string:string': 'required',
				'some_bool:boolean': 'required'
			}
		},
		response: {
			statuses: [200, 400],
			data: [
				'id:decimal',
				'some_text:text',
				'some_string:string',
				'some_bool:boolean'
			]
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