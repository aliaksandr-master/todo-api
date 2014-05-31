<?php

namespace Intercessor;

class EventBroker {

	private $_events = array();

	function publish ($eventName, array $params = array()) {
		$handlers = isset($this->_events[$eventName]) ? $this->_events[$eventName] : array();
		foreach ($handlers as $subscriptionId => $handler) {
			$handler[0]->onPublish($this, $eventName, $handler[1], $params);
		}
		return $this;
	}

	public function onPublish (EventBroker $object, $eventName, $handler, $params) {
		$this->$handler($object, $params, $eventName);
		return $this;
	}

	private function _getSubscriptionId ($object, $handlerName) {
		return get_class($object).'.'.$handlerName;
	}

	function on ($eventName, EventBroker &$object, $handlerName) {
		$this->_events[$eventName][$this->_getSubscriptionId($object, $handlerName)] = array($object, $handlerName);
		return $this;
	}

	function off ($eventName, EventBroker &$object, $handlerName) {
		unset($this->_events[$eventName][$this->_getSubscriptionId($object, $handlerName)]);
		return $this;
	}

	function subscribe (EventBroker &$object, $eventName, $handlerName) {
		$object->on($eventName, $this, $handlerName);
		return $this;
	}

	function unsubscribe (EventBroker &$object, $eventName, $handlerName) {
		$object->off($eventName, $this, $handlerName);
		return $this;
	}

}