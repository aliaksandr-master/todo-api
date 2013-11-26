define('run', [

    'App',
    'jquery',
    'Backbone',
    'FrameView'

], function(App, $, bb, FrameView){

    App.Router = bb.Router.extend({

        initialize:function(){

            App.router = this;

            var frame = new FrameView({
                el: document.body
            });

            this.route('(todo)(/:id)(/)', function(){
                var id = arguments[0] || 0;
                id = +id;
                frame.setActive(id);
            });


        }
    });

    $(function(){
        new App.Router();
		bb.history.start({pushState: true});
    });

});

require("run");