define(function(require, exports, module){
    'use strict';

    var _ = require('underscore');
    var Chaplin = require('chaplin');
	var BaseView = require('views/base/view');
	var session = require('lib/session');
	var lang = require('lib/lang');

	require('lib/view-helper');

	var BaseCollectionView = Chaplin.CollectionView.extend({

		session: session,

		noWrap: true,

		useCssAnimation: true,

		animationStartClass: '-animation-start',

		animationEndClass: '-animation-end',

		getTemplateFunction: BaseView.prototype.getTemplateFunction,

		filterCallback: function(view, included) {
			view.$el.css('display', included ? '' : 'none');
		},

		getTemplateData: function () {
			var data = BaseCollectionView.__super__.getTemplateData.apply(this, arguments);
			if (this.collection.propModel) {
				data = _.clone(data);
				data._prop = this.collection.propModel.attributes;
			}
			data._session = (this.session.model() || {}).attributes;
			data._locale = lang;
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