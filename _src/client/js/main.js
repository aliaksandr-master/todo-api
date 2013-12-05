define('run', function(require, exports, module){
    "use strict";
    
    var App = require('App');
    var $ = require('jquery');
	var bb = require('Backbone');
	var FrameView = require('FrameView');
	var HomeView = require('HomeView');

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
				route.call(this, that.pages[name], that.pages);
			}
		},

		initialize:function(){

			App.router = this;

			this.route('(/)', this.initPage('home', 'HomeView', function(home){
				//

			}));

			this.route('todo(/:id)(/)', this.initPage('todo', 'FrameView', function(frame){
				var id = arguments[0] || 0;
				id = +id;
				frame.setActive(id);
			}));


		}
	});

	$(function(){
		new App.Router();
		bb.history.start({pushState: true});
	});
    
});

require("run");