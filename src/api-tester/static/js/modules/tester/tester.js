define(function (require, exports, module) {
    "use strict";

	var _ = require('lodash');
	var $ = require('jquery');
	var utils = require('lib/utils');
	var random = require('lib/randomizr');
	var URI = require('URIjs/URI');

	var TesterDebug = require('modules/tester/debug/tester-debug');
	var TesterOptions = require('modules/tester/options/tester-options');
	var TesterRequest = require('modules/tester/request/tester-request');
	var TesterRequestData = require('modules/tester/request-data/tester-request-data');
	var TesterResponse = require('modules/tester/response/tester-response');
	var TesterSpec = require('modules/tester/spec/tester-spec');
	var TesterForm = require('modules/tester/form/tester-form');

	var FormatJSON = require('modules/tester/utils/json-format');
	var Panel = require('modules/tester/utils/panel');

	var allFormsUID = [];

	var BaseComponent = require('modules/tester/base/tester-component');

	var Tester = BaseComponent.extend('Tester', {

		initialize: function (router, container, spec, routes) {
			this.tester = this;

			this.router = router;

			this.uid = 'apiTesterForm' + allFormsUID.length;
			allFormsUID.push(this.uid);

			this._spec = spec;
			this._routes = routes;

			this.spec = {};
			this.routes = {};

			this.$el = $(container).eq(0);
			this.el = this.$el.get()[0];

			this.modules = {
				debug: new TesterDebug(this),
				options: new TesterOptions(this),
				request: new TesterRequest(this),
				requestData: new TesterRequestData(this),
				response: new TesterResponse(this),
				form: new TesterForm(this),
				panel: new Panel(this),
				json: new FormatJSON(this),
				spec: new TesterSpec(this)
			};

			this.initEvents();
			this.init();
		},

		init: function () {
			this.spec.current = {};
			this.spec.source = _.cloneDeep(this._spec);
			this.location = null;
			this.element = {};
			this.routes.source = _.cloneDeep(this._routes);
			this.routes.group = _.groupBy(this.routes.source, 'name');
			this.routes.current = [];

			var href = href == null ? window.location.href : href;

			this.location = URI(href);

			this.spec.current = _.cloneDeep(this.spec.source[this.location.query(true).spec] || {});

			if (this.spec.current) {
				this.routes.current = this.routes.group[this.spec.current.name] || [];
			}

			if (_.isEmpty(this.routes.current)) {
				this.spec.current = {};
			}

			var loadParams = this.load();
			_.each(this.modules, function (module, name) {
				module.init();
				if (module.load) {
					module.load(loadParams[name]);
				}
			}, this);
		},

		saveToHistory: function (href, params) {
			if (this.history == null) {
				this.history = {};
			}
			if (this.history[href] != null) {
				return;
			}

			this.history[href] = true;

			var date = new Date();
			var time = date.getHours() + ':' + date.getMinutes();
			var $a = $('<a/>').attr('href', href).html('');
			this.$('#api-tester-history .panel-body').append(
				'<div class="api-tester-history-item">' +
					'<a href="' + href + '">' + '<span class="label label-success">' + params.method + '</span> ' + params.uri + ' <b>(' + time + ')</b>' +'</a>' +
				'</div>'
			);
		},

		showHeaders: function (xhr, content) {
			var contentSrc = xhr.getAllResponseHeaders();
			var headers = {};
			contentSrc.replace(/^(.*?):[ \t]*([^\r\n]*)$/mg, function (w, name, value) {
				headers[name] = value;
			});
			this.modules.panel.insertToRaw('response-headers', contentSrc, this.modules.json.format(headers));
		},

		showErrors: function (string) {
			this.$("#errors").html(string || '');
		},

		showResponse: function (contentSrc, content) {
			content || (content = contentSrc);

			if (_.isObject(content)) {
				this.modules.panel.insertToRawMlt('response-data', contentSrc, content.data);
				this.modules.panel.insertTo('response-meta', this.tester.modules.json.format(content.meta));
				this.modules.panel.insertTo('response-status', this.tester.modules.json.format(_.omit(content, 'meta', 'data')));
			} else {
				this.modules.panel.insertToRawMlt('response-data', contentSrc, null);
				this.modules.panel.insertToRaw('response-meta', '', '');
				this.modules.panel.insertToRaw('response-status', '', '');
			}
		},

		showRequestData: function (srcData, data) {
			data || (data = srcData);
			if($.isPlainObject(data)){
				data =  this.modules.json.format(data);
			}
			this.modules.panel.insertToRaw('request-data', srcData, data);
		},

		showInfo: function (requestObj, response, jqXHR) {
			this.$('#api-tester-interaction-info .panel-body').html( this.modules.json.format({
				jq_time: (Date.now() -requestObj.time)/1000,
				url: requestObj.params.url,
				method: requestObj.params.type,
				contentType: requestObj.params.contentType,
				dataType: requestObj.params.dataType,
				encoding: jqXHR.getResponseHeader('Content-Encoding'),
				compress_saved: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			}));
		},

		save: function () {
			var params = {
				method: this.$('#form-route-method').val(),
				uri: this.$('#form-route-url').val(),
				route: this.$('#form-route').val(),
				values: {
					query: this.modules.form.getDataFromRegion('query'),
					body: this.modules.form.getDataFromRegion('body'),
					params: this.modules.form.getDataFromRegion('params')
				},
				spec: {
					query: this.modules.form.getRegionElement('query').data('spec'),
					body: this.modules.form.getRegionElement('body').data('spec'),
					params: this.modules.form.getRegionElement('params').data('spec')
					// need add current form structure
				},
				format: {
					request: $('#form-request-format').val(),
					response: $('#form-response-format').val()
				}
			};

			_.each(this.modules, function (module, name) {
				if (module.save) {
					params[name] = module.save();
				}
			});

			this.router.replaceParam('params', JSON.stringify(params));

			this.saveToHistory(window.location.href, params);
		},

		load: function () {
			var query = this.location.query(true);
			return query.params ? JSON.parse(query.params) : {};
		}
	});

    return Tester;
});