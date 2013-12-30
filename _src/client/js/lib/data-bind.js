define(function(require, exports, module){
    "use strict";

	var _ = require('underscore');
	var $ = require("jquery");

	var setToElement = function(view, $el, val){
		if($el.is("input")){
			if ($el.is(":radio")) {
				view.$(':radio[name="' + $el.attr("name") + '"]').attr("checked", false)
					.filter(':radio[value="' + val + '"]').attr("checked", true);
			} else if ($el.is(":checkbox")) {
				$el.attr("checked", !!val);
			} else {
				$el.val(val);
			}
		} else if($el.is("select")  || $el.is("textarea")) {
			$el.val(val);
		}else {
			$el.html(val);
		}
	};
	var _ID_ = 0;
    var dataBind = function(view, model, binds){
		var id = _ID_++;
		model = model || view.model;
		binds = binds || view.binds;

		if(_.isFunction(binds)) {
			binds = binds.call(view);
		}
		if(!model || !binds){
			return;
		}

		var _bindedElmSelectors = {};
		_.each(binds, function(attributeName, element){
			element = element.split(/[ ]+/);

			var eventBind = element.shift();
			var selector = element.join(" ");

			var callback = null;
			var callbackElement = null;

			if(_.isArray(attributeName)){
				var arr = attributeName;
				if(_.isString(arr[0])){
					attributeName = arr.shift();
				}
				if(_.isFunction(arr[0])){
					callback = arr[0];
				}
				if(_.isFunction(arr[1])){
					callbackElement = arr[1];
				}
			}


			if(_.isFunction(attributeName)){
				callback = attributeName;
				attributeName = null;
			}

			if(/change|click|blur|focus/.test(eventBind)){
				if(!callback){
					if(_bindedElmSelectors[eventBind] == null){
						_bindedElmSelectors[eventBind] = [];
					}
					var event = eventBind.split(".");
					_bindedElmSelectors[eventBind].push({
						event: event + ".dataBind"+id,
						selector: selector,
						attributeName: attributeName,
						callbackElement: callbackElement
					});
				}
			}else{
				selector = eventBind + " " +selector;
				eventBind = null;
			}

			if(!selector){
				return;
			}

			if(callback){
				view.listenTo(model, "change", function () {
					var $el = view.$(selector);
					var val = callback.call(view, model);
					$el.each(function(){
						setToElement(view, $(this), val);
					});
				});
				return;
			}

			if(!attributeName){
				return;
			}

			view.listenTo(model, "change:" + attributeName, function () {
				var val, $el;
				val = model.get(attributeName);
				$el = view.$(selector);
				$el.each(function(){
					setToElement(view, $(this), val);
				});
			});

		});

		_.each(_bindedElmSelectors, function(event, eventName){
			_.each(event, function(ev){
				if(ev.event && ev.selector && (ev.callbackElement || ev.attributeName)){
					view.$el.on(ev.event, ev.selector, function(){
						var $el = $(this);
						if (ev.callbackElement) {
							ev.callbackElement.call(view, $el, model);
						} else {
							var val = $el.is(":checkbox") ? $el.is(":checked") : $el.val();
							model.set(ev.attributeName, val);
						}
					});
				}
			});
		});

		var unbind = function(){
			_.each(_bindedElmSelectors, function(event, eventName){
				view.$el.off(".dataBind"+id);
				_.each(event, function(ev){
					view.$el.off(".dataBind"+id, ev.selector);
					view.$(ev.selector).off(".dataBind"+id);
				});
			});
		};

		view.listenTo(model, "destroy", unbind);
		view.listenTo(view, "unbindDataAll", unbind);
		view.listenTo(view, "unbindData:" + id, unbind);
		return id;
	};

	var dataUnBindAll = function(view){
		view.trigger("unbindDataAll");
	};

	var dataUnBind = function(view, id){
		view.trigger("unbindData:" + id);
	};

    return {
		viewDataBind: function(model, binds){
			dataBind(this, model, binds);
			return this;
		},
		bind: dataBind,

		unbind: dataUnBind,
		viewDataUnBind: function(id){
			dataUnBind(this, id);
			return this;
		},

		unbindAll: dataUnBindAll,
		viewDataUnBindAll: function(){
			dataUnBindAll(this);
			return this;
		}
	};
});