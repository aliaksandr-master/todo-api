define(function(require, exports, module){
    "use strict";

    var $ = require('jquery');
    var _ = require('lodash');
    var SpecCompiler = require('./form-generator');

	var template = require('lib/templater');

	var formGen = new SpecCompiler({
		templates: {
			field:  template('gen/field'),
			text:   template('gen/text'),
			flag:   template('gen/flag'),
			cover:  template('gen/cover'),
			wrapper:   template('gen/form'),
			custom: template('gen/cover')
		},
		types: {
			text: {
				template: 'text'
			},
			string: {
				template: 'field'
			},
			decimal: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseInt(val, 10);
					}
					return undefined;
				}
			},
			float: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseFloat(val);
					}
					return undefined;
				}
			},
			integer: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseInt(val, 10);
					}
					return undefined;
				}
			},
			boolean: {
				template: 'flag',
				convert: function (val) {
					return Boolean(val);
				}
			},
			cover: {
				template: 'cover'
			},
			object: {
				template: 'cover'
			},
			array: {
				array:    true,
				template: 'cover'
			}
		}
	});

	var form = formGen.render([
		{'hello': {
			type: 'decimal',
			label: 'Hello:'
		}},
		{'params:array': [
			{val: {
				type: 'string',
				label: 'hello',
				template: 'custom'
			}},
			{id: 'decimal'},
			{'object': {
				type: 'object',
				nested: [
					{username: 'string'},
					{password: 'decimal'},
					{save: 'boolean'}
				]
			}}
		]},
		{options: {
			type: 'object',
			nested: [
				{username11: 'string'},
				{password3: 'decimal'},
				{save: 'boolean'},
				{object2: {
					type: 'object',
					nested: [
						{username4: 'string'},
						{password5: 'decimal'},
						{save6: 'boolean'}
					]
				}}
			]
		}},
		{'#options': [
			{username11: 'string'},
			{password3: 'decimal'},
			{save: 'boolean'},
			{object2: {
				type: 'object',
				nested: [
					{username4: 'string'},
					{password5: 'decimal'},
					{save6: 'boolean'}
				]
			}}
		]}
	], {
		hello: '111 hello!!!',
		params: [
			{
				val: 333,
				object: {
					username: 333444
				}
			},
			{
				val: 111,
				object: {
					username: 2222222
				}
			}
		],
		options: {
			username11: 'victor!',
			object: {
				password5: 112222333
			}
		}
	});

	$('#test').append(form);

	var vals = formGen.serialize($('#test'));
	var vals2 = formGen.serialize($('#test'), false);
	console.log(vals, vals2);

});