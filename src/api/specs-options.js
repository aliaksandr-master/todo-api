'use strict';

module.exports = {

	source: true,

	beauty: false,

	verbose: false,

	methods: {
		GET:    'GET',
		HEAD:   'HEAD',
		PATCH:  'PATCH',
		PUT:    'UPDATE',
		POST:   'CREATE',
		DELETE: 'DELETE',
		OPTION: 'OPTION'
	},

	rules: {
		'public': [
			'required',
			'decimal',
			'integer',
			'float',
			'max_length',
			'min_length',
			'exact_length'
		]
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