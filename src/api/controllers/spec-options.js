'use strict';


module.exports = {

	router: {
		arrayPattern: /\(\.\.\.([a-zA-Z_][a-zA-Z0-9_]*)\)/g
	},

	mimes: {
		json: [
			'application/json',
			'json'
		],
		jsonp: [
			'application/javascript',
			'jsonp'
		]
	},

	statuses: {
		'100': { success: true, code: 100, message: 'Continue' },
		'101': { success: true, code: 101, message: 'Switching Protocols' },

		'200': { success: true, code: 200, message: 'OK' },
		'201': { success: true, code: 201, message: 'Created' },
		'202': { success: true, code: 202, message: 'Accepted' },
		'203': { success: true, code: 203, message: 'Non-Authoritative Information' },
		'204': { success: true, code: 204, message: 'No Content' },
		'205': { success: true, code: 205, message: 'Reset Content' },
		'206': { success: true, code: 206, message: 'Partial Content' },

		'300': { success: true, code: 300, message: 'Multiple Choices' },
		'301': { success: true, code: 301, message: 'Moved Permanently' },
		'302': { success: true, code: 302, message: 'Moved Temporarily' },
		'303': { success: true, code: 303, message: 'See Other' },
		'304': { success: true, code: 304, message: 'Not Modified' },
		'305': { success: true, code: 305, message: 'Use Proxy' },

		'400': { success: false, code: 400, message: 'Bad Request' },
		'401': { success: false, code: 401, message: 'Unauthorized' },
		'402': { success: false, code: 402, message: 'Payment Required' },
		'403': { success: false, code: 403, message: 'Forbidden' },
		'404': { success: false, code: 404, message: 'Not Found' },
		'405': { success: false, code: 405, message: 'Method Not Allowed' },
		'406': { success: false, code: 406, message: 'Not Acceptable' },
		'407': { success: false, code: 407, message: 'Proxy Authentication Required' },
		'408': { success: false, code: 408, message: 'Request Time-out' },
		'409': { success: false, code: 409, message: 'Conflict' },
		'410': { success: false, code: 410, message: 'Gone' },
		'411': { success: false, code: 411, message: 'Length Required' },
		'412': { success: false, code: 412, message: 'Precondition Failed' },
		'413': { success: false, code: 413, message: 'Request Entity Too Large' },
		'414': { success: false, code: 414, message: 'Request-URI Too Large' },
		'415': { success: false, code: 415, message: 'Unsupported Media Type' },

		'500': { success: false, code: 500, message: 'Internal Server Error' },
		'501': { success: false, code: 501, message: 'Not Implemented' },
		'502': { success: false, code: 502, message: 'Bad Gateway' },
		'503': { success: false, code: 503, message: 'Service Unavailable' },
		'504': { success: false, code: 504, message: 'Gateway Time-out' },
		'505': { success: false, code: 505, message: 'HTTP Version not supported' }
	},

	stringNameFormat: '', // camel, underscore

	defaultType: 'string',

	types: {

		boolean: {
			routeMask: '[^/]+',
			filters: [
				'to_bool'
			],
			rules: []
		},

		decimal: {
			routeMask: '[0-9]+',
			validation: [
				'decimal'
			],
			filters: [
				'to_int'
			]
		},

		integer: {
			routeMask: '-?[0-9]+',
			validation: [
				'integer',
				{ max_length: 11 }
			],
			filters: [
				'to_int'
			]
		},

		float: {
			routeMask: '-?[0-9]+[.]?[0-9]*[eE]?-?[0-9]*',
			validation: [
				'float',
				{ max_length: 65 }
			],
			filters: [
				'to_float'
			]
		},

		text: {
			routeMask: '[^/]+'
		},

		string: {
			routeMask: '[^/]+',
			validation: [
				{ max_length: 255 }
			],
			filters:[
				'trim',
				'xss'
			]
		}
	}
};