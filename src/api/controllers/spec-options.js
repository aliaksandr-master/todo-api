'use strict';


module.exports = {

	rules: {
		'public': []
	},

	mimes: {
		xml: [
			'application/xml',
			'xml',
			'text/xml'
		],
		json: [
			'application/json',
			'json'
		],
		jsonp: [
			'application/javascript',
			'jsonp'
		],
		form: [
			'application/x-www-form-urlencoded'
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

		'400': { success: true, code: 400, message: 'Bad Request' },
		'401': { success: true, code: 401, message: 'Unauthorized' },
		'402': { success: true, code: 402, message: 'Payment Required' },
		'403': { success: true, code: 403, message: 'Forbidden' },
		'404': { success: true, code: 404, message: 'Not Found' },
		'405': { success: true, code: 405, message: 'Method Not Allowed' },
		'406': { success: true, code: 406, message: 'Not Acceptable' },
		'407': { success: true, code: 407, message: 'Proxy Authentication Required' },
		'408': { success: true, code: 408, message: 'Request Time-out' },
		'409': { success: true, code: 409, message: 'Conflict' },
		'410': { success: true, code: 410, message: 'Gone' },
		'411': { success: true, code: 411, message: 'Length Required' },
		'412': { success: true, code: 412, message: 'Precondition Failed' },
		'413': { success: true, code: 413, message: 'Request Entity Too Large' },
		'414': { success: true, code: 414, message: 'Request-URI Too Large' },
		'415': { success: true, code: 415, message: 'Unsupported Media Type' },

		'500': { success: true, code: 500, message: 'Internal Server Error' },
		'501': { success: true, code: 501, message: 'Not Implemented' },
		'502': { success: true, code: 502, message: 'Bad Gateway' },
		'503': { success: true, code: 503, message: 'Service Unavailable' },
		'504': { success: true, code: 504, message: 'Gateway Time-out' },
		'505': { success: true, code: 505, message: 'HTTP Version not supported' }
	},

	types: {

		boolean: {
			formatExp: '.+',
			filters: [
				'to_bool'
			]
		},

		decimal: {
			formatExp: '[0-9]+',
			rules: [
				'decimal'
			],
			filters: [
				'to_int'
			]
		},

		integer: {
			formatExp: '-?[0-9]+',
			rules: [
				'integer',
				{ max_length: 11 }
			],
			filters: [
				'to_int'
			]
		},

		float: {
			formatExp: '-?[0-9]+[.]?[0-9]*[eE]?-?[0-9]*',
			rules: [
				'float',
				{ max_length: 65 }
			],
			filters: [
				'to_float'
			]
		},

		text: {
			formatExp: '.+'
		},

		string: {
			formatExp: '.+',
			rules: [
				{ max_length: 255 }
			],
			filters:[
				'trim',
				'xss'
			]
		}
	}
};