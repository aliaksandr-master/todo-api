define(function(require){
    "use strict";

	var BaseView = require("views/base/view");

	var template = require('templates/todo/list-item');
	require('css!styles/todo/list-item');

    var C_LI             = "todo-li";
    var C_LI_DONE        = "-done";
    var C_LI_META_ACTIVE = "-active";

    var ListItemView = BaseView.extend({

        //Шаблон элемента
        template: template,
		autoRender: true

    });

	return ListItemView;
});