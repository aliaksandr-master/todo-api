define('App',function(require){
    "use strict";

	var _ = require('underscore');
	var bb = require('backbone');
	var Handlebars = require('handlebars');

    var App = {};

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

    App.renderers = {
        ext:{
            hbs:  "handlebars",
            html: "underscore"
        },
        compiler:{

            handlebars: function(template){
                return Handlebars.compile(template);
            },

            underscore: function(template){
                return _.template(template);
            }

        }
    };

    return App;
});