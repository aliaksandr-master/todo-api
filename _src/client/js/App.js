define('App',[

    'underscore',
    'Backbone',
    'Handlebars'

],function(_, bb, Handlebars){
    "use strict";

    var App = {};

    if(window.localStorage != null){
        if(localStorage.getItem("build") != window.build){
            localStorage.clear();
            localStorage.setItem("build", window.build);
            console.log("clear storage");
        }
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