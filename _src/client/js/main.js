define('run', function(require, exports, module){
    "use strict";
    
    var App = require('App');
    var $ = require('jquery');
	var bb = require('Backbone');

	App.Router = bb.Router.extend({

		pages: {},

		initPage: function(name, viewName, route){
			var that = this;
			return function(){
				if(!that.pages.hasOwnProperty(name)){
					that.pages[name] = new (require(viewName))({
						el: document.body
					});
				}
				route.call(this, that.pages[name], that.pages, arguments);
			};
		},

		initialize:function(){

			App.router = this;

			this.route('(/)', this.initPage('home', 'HomeView', function(view){
				//

			}));

			this.route('login(/)', this.initPage('login', 'PageLoginView', function(view){
				//

			}));

			this.route('register(/)', this.initPage('register', 'PageRegisterView', function(view){
				//

			}));

			this.route('todo(/:id)(/)', this.initPage('todo', 'FrameView', function(frame, pages, args){
				var id = args[0] || 0;
				id = +id;
				frame.setActive(id);
			}));

		}
	});

	$(function(){
		var router = new App.Router();
		bb.history.start({pushState: true});
	});
    
});

require("run");