define('ListModel',[

    'Backbone'

],function(Backbone){
    "use strict";
    
    return Backbone.Model.extend({
        defaults: function(){
            return {
                isActive: false,
                title: "",
                todoListId: null
            };
        }
    });

});