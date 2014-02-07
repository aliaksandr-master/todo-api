define(function(require, exports, module){
    "use strict";

    var _ = require('underscore');
    var Chaplin = require('chaplin');
	var BaseView = require('views/base/view');

	require('lib/view-helper');

	var BaseCollectionView = Chaplin.CollectionView.extend({

		noWrap: true,

		getTemplateFunction: BaseView.prototype.getTemplateFunction,

		filterCallback: function(view, included) {
			if (included) {
				view.$el.css('display', '');
			} else {
				view.$el.hide();
			}
		},

		getTemplateData: function () {
			var data = BaseCollectionView.__super__.getTemplateData.apply(this, arguments);
			if (this.collection.propModel) {
				data = _.clone(data);
				data._prop = this.collection.propModel.attributes;
			}
			return data;
		},

		render: function () {
			_.each(this.subviews,  function (subview) {
				if (subview.el && subview.el.parentNode) {
					subview.el.parentNode.removeChild(subview.el);
				}
			});
			BaseCollectionView.__super__.render.apply(this, arguments);

		}
	});

    return BaseCollectionView;
});