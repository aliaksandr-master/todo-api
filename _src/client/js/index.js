'use strict';

require.config({
	// The path where your JavaScripts are located

	baseUrl: '/client${config:cacheKey}/js/',

	// Specify the paths of vendor libraries
	paths: {
		templates: '../templates',
		jquery: '../vendor/jquery/jquery',
		underscore: '../vendor/underscore/underscore',
		backbone: '../vendor/backbone/backbone',
		handlebars: '../vendor/handlebars/handlebars',
		text: '../vendor/requirejs-text/text',
		chaplin: '../vendor/chaplin/chaplin'
	},

	// Underscore and Backbone are not AMD-capable per default,
	// so we need to use the AMD wrapping of RequireJS
	shim: {
		jquery:{
			exports: "jQuery"
		},
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		handlebars: {
			exports: 'Handlebars'
		}
	}
});

define('register', function(require, exports, module){

	var $ = require('jquery');
	var Chaplin = require('chaplin');
	var bb = require('backbone');
	var _ = require('underscore');
	var Handlebars = require('handlebars');

	var register = {};

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

	register.Router = bb.Router.extend({

		pages: {},

		initPage: function(name, viewName, route){
			var that = this;
			return function(){
				var me = this;
//				if(!that.pages.hasOwnProperty(name)){
//
////					require(viewName, function(View){
////						that.pages[name] = new View({
////							el: document.body
////						});
////						route.call(me, that.pages[name], that.pages, arguments);
////					});
//
//				}else{
//					route.call(me, that.pages[name], that.pages, arguments);
//				}

			};
		},

		initialize:function(){

			register.router = this;

//			this.route('(/)', this.initPage('home', 'HomeView', function(view){
//				//
//
//			}));
//
//			this.route('login(/)', this.initPage('login', 'PageLoginView', function(view){
//				//
//
//			}));
//
//			this.route('register(/)', this.initPage('register', 'PageRegisterView', function(view){
//				//
//
//			}));
//
//			this.route('todo(/:id)(/)', this.initPage('todo', 'FrameView', function(frame, pages, args){
//				var id = args[0] || 0;
//				id = +id;
//				frame.setActive(id);
//			}));

		}
	});

	var _started = false;
	register.start = function(){
		if(_started){
			return;
		}
		_started = true;

		$(function(){
			register.router = new register.Router();

			bb.history.start({
				pushState: true
			});
		});

	};

	return register;
});

require(['register', 'application', 'routes'],function(register, Application, routes){

	register.application = new Application({

		routes: routes,
		controllerSuffix: ''

	});

});