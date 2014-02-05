define(function(require, exports, module){
    "use strict";

    var Handlebars = require('handlebars');
    var Chaplin = require('chaplin');
    var $ = require('jquery');
    var _ = require('underscore');
    var utils = require('lib/utils');
    var request = require('lib/request');
	var errorMessage = require('templates/elements/form-error');

	var lang = require('lib/lang');

	var forms = {
		defaults: {
			provider: "api",
			method: "POST",
			dataType: 'json'
		},
		options: {
			prepareData: function($form, data){
				var vals = {};
				_.each(data, function(v){
					vals[v.name] = v.value;
				});
				return vals;
			}
		}
	};

	$.fn.smartForm = function ($_opt, context) {

		var $el = $(this);

		if ($el.data('$hasSmartForm')) {
			return;
		}
		$el.data('$hasSmartForm', true);

		var _opt = _.extend({}, forms.options, $_opt);

		$el.on('submit', 'form', function(){
			var opt = _.clone(_opt);
			var _success = opt.success;
			var _error   = opt.error;
			delete opt.success;
			delete opt.error;
			var $form = $(this);

			var provider = $form.attr('data-provider') || forms.defaults.provider;
			var method = $form.attr('method') || forms.defaults.method;

			var url = $form.attr('action');
			var name = $form.attr('data-name');

			if (!name) {
				window.console && console.error('undefined FORM NAME (attr "data-name")');
				return false;
			}

			if (!url) {
				window.console && console.error('undefined action for ajax form submit in form');
				return false;
			}

			opt.type = method.toUpperCase();

			var vals = opt.prepareData($form, $form.serializeArray());
			opt.data = vals;

			opt.success = function(){
				$form.hideErrorAll();
				if (_success) {
					_success.apply(context || this, arguments);
				}
			};

			opt.error = function(jqXHR){
				var response = jqXHR.responseJSON;
				if(response && response.errors){
					_.each(vals, function(val, fieldName){
						var $el = $('[name="' + fieldName + '"]', $form);
						if (response.errors.input[fieldName]) {
							var rule = _.pairs(response.errors.input[fieldName]);
							$el.showError($form, fieldName, vals[fieldName], rule[0][0], rule[0][1]);
						} else {
							$el.hideError();
						}
					});
				} else if(_.isNull(response)){
					utils.shooptwServerError();
				}
				if(_error){
					_error.apply(context || this, arguments);
				}
			};

			request.load(url, provider, opt);

			return false;
		});
	};

	var defaultMessage = lang.rules['default'] || '';
	var messageMap = {};

	var message = function (ruleName, fieldName, value, params) {
		if(!messageMap.hasOwnProperty(ruleName)){
			var _message = '';
			if (lang.rules && lang.rules[ruleName]) {
				_message = lang.rules[ruleName];
			} else if (lang.rules && lang.rules['default']) {
				_message = defaultMessage;
				window.console && console.error('undefined message for rule "' + ruleName + '"');
			} else {
				window.console && console.error('undefined message for rule "default"');
			}
			messageMap[ruleName] = Handlebars.compile(_message);
		}
		return messageMap[ruleName]({
			value: value,
			fieldName: fieldName,
			param: _.map(params, function (v) {
				return {value: v};
			})
		});
	};

	$.fn.showError = function ($form, fieldName, value, ruleName, params) {
		var $formGroup = $(this).closest('.form-group');
		var $error = $formGroup.find('.form-error').eq(0);

		if(!$error.length){
			$formGroup.append(errorMessage());
			$error = $formGroup.find('.form-error').eq(0);
		}

		$formGroup.addClass('has-error');
		var name = $form.attr('data-name');
		var names = lang.forms[name] || {};

		$error.html(message(ruleName, names[fieldName] || fieldName, value, params));
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