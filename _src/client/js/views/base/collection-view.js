define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
	var BaseView = require('views/base/view');

	var BaseCollectionView = Chaplin.CollectionView.extend({

		getTemplateFunction: BaseView.prototype.getTemplateFunction,

		filterCallback: function(view, included) {
			if (included) {
				view.$el.css('display', '');
			} else {
				view.$el.hide();
			}
		}
	});

    return BaseCollectionView;
});