define(function(require, exports, module){
	"use strict";

	var helper = require('helper');
	var Chaplin = require('chaplin');
	var Backbone = require('backbone');

	var $ = require('jquery');
	var _ = require('underscore');
	var utils = require('lib/utils');
	var User = require('models/user');
	var VendorUser = require('models/user-vendor');
	var YogaProvider = require('lib/services/yoga-provider');
	var FacebookProvider = require('lib/services/facebook-provider');
	var DisqusProvider = require('lib/services/disqus-provider');

	var mediator = Chaplin.mediator;

	var SessionController = helper.BackboneClass(Backbone.Events, Chaplin.EventBroker, {
		disposed: false,

		serviceProviders: {
			yoga: {
				// TODO: add dynamic providers loading
				//path: 'lib/services/yoga-provider',
				constructor: YogaProvider,
				listen: {
					'session': 'sessionHandler',
					'logout': 'logoutHandler'
				},
				api: {
					'getLoginStatus': 'getLoginStatus',
					'register': 'register',
					'login': 'login',
					'logout': 'logout',
					'resetPasswordRequest': 'resetPasswordRequest',
					'resetPassword': 'resetPassword',
					'notifyAction': 'notifyAction'
				}
			},
			facebook: {
				constructor: FacebookProvider,
				listen: {
					'session': function(session) {
						var context = session.context || {};
						return this.auth('yoga', 'login', {
							accessToken: session.accessToken,
							rememberMe: context.rememberMe
						});
					},
					'like': function(data) {
						this.api('yoga', { method: 'notifyFacebookLike' }, data, true);
					},
					'unlike': function(data) {
						this.api('yoga', { method: 'notifyFacebookLike' }, data, false);
					}
				},
				api: {
					'loadLikeCount': 'loadLikeCount',
					'login': 'login',
					'logout': 'logout'
				}
			},
			disqus: {
				constructor: DisqusProvider,
				api: {
					'loadCommentCount': 'loadCommentCount'
				}
			}
		},

		initialize: function() {
			this.subscribeEvent('dispatcher:dispatch', this.updatePageTitle);

			mediator.setHandler('api', this.api, this);
			mediator.setHandler('sync', this.sync, this);
			mediator.setHandler('auth', this.auth, this);
		},

		prepareServiceProvider: function(provider) {
			var controller = this,
				serviceProviderData = this.serviceProviders[provider],
				serviceProvider = serviceProviderData.instance;

			if (!serviceProvider) {
				// TODO: add dynamic providers loading instead of this
				serviceProvider = serviceProviderData.instance = new serviceProviderData.constructor();
				_.each(serviceProviderData.listen, function(handler, serviceProviderEvent) {
					controller.listenTo(serviceProvider, serviceProviderEvent, _.isFunction(handler) ? handler : controller[handler]);
				});
			}

			// TODO: throw exceptions if smth of the above isn't found

			return serviceProvider.load();
		},

		updatePageTitle: function(controller, params, route, options) {
			var uri = utils.addParamsToUrl(route.path/*, options && options.query*/),
				titleHandler = function(response) {
					var title = response.title || '';

					if (!controller.disposed) {
						mediator.execute('adjustTitle', title);
					}
				};

			return this.api('yoga', { method: 'getPageMetadata' }, uri, {
				success: titleHandler,
				error: titleHandler
			});
		},

		api: function(provider, method) {
			var serviceProviderData = this.serviceProviders[provider],
				methodName = _.isObject(method) ? method.method : serviceProviderData.api[method],
				methodArguments = arguments;

			// TODO: throw exceptions if smth of the above isn't found

			// TODO: maybe refactor this according to AOP style
			return this.prepareServiceProvider(provider).then(function(serviceProvider) {
				var serviceMethod = serviceProvider[methodName];

				return serviceMethod.apply(serviceProvider, Array.prototype.slice.call(methodArguments, 2));
			});
		},

		sync: function(provider, method, model, options) {
			// This needs to be called synchronously
			if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
				options = _.extend({
					data: options.attrs || model.toJSON()
				}, options);
			}

			return this.api(provider, { method: 'sync' }, method, model, options);
		},

		// TODO: ??? do we really need a separate command for this
		auth: function(provider, method, data, options) {
			var serviceProviderData = this.serviceProviders[provider];

			if (provider === 'yoga' && method === 'getLoginStatus') {
				var loginStatusPromise = serviceProviderData.loginStatusPromise;
				if (!loginStatusPromise && !serviceProviderData.loginStatusDetermined) {
					loginStatusPromise = serviceProviderData.loginStatusPromise = this.api(provider, method, data, options || {}).then(function(response) {
						serviceProviderData.loginStatusDetermined = true;
						serviceProviderData.loginStatusPromise = null;
						return response;
					});
				}
				return loginStatusPromise;
			} else {
				return this.api(provider, method, data, options || {});
			}
		},

		// Handler for the global sessionHandler event
		sessionHandler: function(session) {
			var userAttributes = session.user,
				userModel = mediator.user,
				UserClass;

			// catch the second and subsequent successful serviceProvider.getLoginStatus() calls
			if (userModel && userModel.get('id') === userAttributes.id) {
				userModel.set(userAttributes, { parse: true });

				// TODO: check if this works without moving into 'change' event handler
				if (userModel.hasChanged()) {
					this.publishEvent('userDataUpdate', userModel);
				}
			} else {
				// Needed for a case when you logged as another user, for example, from another browser tab
				this.disposeUser();

				switch (userAttributes.role) {
					case 'vendor':
						UserClass = VendorUser;
						break;
					case 'user':
						UserClass = User;
						break;
					default:
						throw new Error("A user you've just logged as has unknown role");
				}
				// Setting host manually because this can be automatically done only by provider sync method
				userModel = mediator.user = new UserClass();
				userModel.host = this.serviceProviders['yoga'].instance.getHost();
				userModel.set(userModel.parse(userAttributes));

				this.publishEvent('login', userModel);
				this.publishEvent('loginStatus', true);
			}
		},

		logoutHandler: function() {
			this.disposeUser();
			this.publishEvent('loginStatus', false);
		},

		disposeUser: function() {
			if (mediator.user == null) {
				return;
			}
			mediator.user.dispose();
			mediator.user = null;
		},

		dispose: function () {
			var obj, prop;
			if (this.disposed) {
				return;
			}
			for (prop in this) {
				if (_.has(this, prop)) {
					obj = this[prop];
					if (!(obj && typeof obj.dispose === "function")) {
						continue;
					}
					obj.dispose();
					delete this[prop];
				}
			}
			this.unsubscribeAllEvents();
			this.stopListening();
			this.disposed = true;
			return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
		}
	});

	return SessionController;
});