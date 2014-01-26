define(function(require, exports, module){
    "use strict";

    var Handlebars = require('handlebars');
    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var _ = require('underscore');
    var utils = require('lib/utils');
    var request = require('lib/request');

	request.load('/_generated_/api.source.json', 'api', true).then(function (jqHXR) {
		console.log('>>>',jqHXR);
	});

	var defaultMessage = Handlebars.compile('{{name}} incorrect');
	var messageMap = {};

	var fieldNameMap = {
		username: 'Username',
		email: 'Email',
		password: 'Password',
		confirm_password: 'Confirm Password'
	};

	var messageFuncMap = {};
	_.each(messageMap, function(v, n){
		messageFuncMap[n] = Handlebars.compile(v);
	});

	$.fn.showError = function (fieldName, value, ruleName, params) {
		console.log(arguments);
		var messageFunc = _.isFunction(messageFuncMap[ruleName]) ? messageFuncMap[ruleName] : defaultMessage;
		if(!_.isFunction(messageFuncMap[ruleName])){
			console.error('undefined message function on rule "', ruleName,'"');
		}
		if(!$(this).next('.form-error').length){
			$(this).closest('.form-group').addClass('has-error');
			$(this).after('<div class="form-error">' + messageFunc({
				value: value,
				name: fieldNameMap[fieldName] || fieldName,
				params: params
			}) + '</div>');
		}
	};

	$.fn.hideError = function () {
		$(this).next('.form-error').remove();
		$(this).closest('.form-group').removeClass('has-error');
	};

	$.fn.hideErrorAll = function () {
		$(this).find('.form-error').remove();
		$(this).find('.has-error').removeClass('has-error');
	};

	Handlebars.registerHelper('url', function() {
		var options, params, routeName, _i;
		routeName = arguments[0], params = 3 <= arguments.length ? Array.prototype.slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), options = arguments[_i++];
		return Chaplin.helpers.reverse(routeName, params);
	});

	Handlebars.registerHelper('firstRow', function() {
		return (arguments[0] == null ? "" : arguments[0]).replace(/^\s+/, "").split(/[\n\r]+/).shift();
	});

	Handlebars.registerHelper('plus', function() {
		return arguments[0] + arguments[1];
	});

	return null;
});