<?php



abstract class IntercessorAbstract {

	/** @var Intercessor */
	protected $api;


	abstract public function _configure ($name, $method, $uri, array $params);


	function systemError ($reason = null, $status = 500) {
		$this->api->error('system', $reason, $status, true);
	}


	function contentError ($reason = null, $status) {
		$this->api->error('content', $reason, $status, true);
	}


	function inputDataErrors (array $array) {
		$this->api->error('input', $array, 400, true);
	}


	function inputDataError ($fieldName, $reason, array $params = array()) {
		$this->api->error('input', array(
			$fieldName => array(
				$reason => $params
			)
		), 400, true);
	}
}