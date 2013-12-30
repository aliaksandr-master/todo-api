define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
	var BaseView = require('views/base/view');
	var bind = require('lib/data-bind');

	require('lib/view-helper');

	var BaseCollectionView = Chaplin.CollectionView.extend({

		initialize: function(){
			BaseCollectionView.__super__.initialize.apply(this, arguments);
		},

		attach: function(){
			var r = BaseCollectionView.__super__.attach.apply(this, arguments);
			this.unbindAll();
			this.bind();
			return r;
		},

		remove: function(){
			this.unbindAll();
			return BaseCollectionView.__super__.remove.apply(this, arguments);
		},

		bind: bind.viewDataBind,
		unbind: bind.viewDataUnBind,
		unbindAll: bind.viewDataUnBindAll,

		noWrap: true,

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