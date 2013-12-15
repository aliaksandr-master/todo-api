define('ListModel',function(require){
    "use strict";

	var bb = require('backbone');
    
    return bb.Model.extend({
        defaults: function(){
            return {
                isActive: false,
                title: "",
                todoListId: null
            };
        }
    });

});