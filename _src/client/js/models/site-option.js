define("OptionModel", function(require){
    "use strict";

	var bb = require('backbone');

    return bb.View.extend({

        defaults:function(){
            return {
                id: null,
                name: "",
                value: ""
            };
        }

    });

});