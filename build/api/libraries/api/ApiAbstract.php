<?php



abstract class ApiAbstract implements IApiError {

	/** @var array */
	protected $_errors = array();

	/** @var Api */
	protected $api;


	public function check () {
		return $this->valid();
	}


	function error ($message = null, $code = 500, $fatal = false) {
		if (is_null($message)) {
			$message = ApiUtils::getMessageByCode($code);
			if (is_null($message)) {
				$this->error('UNDEFINED STATUS CODE "'.$code.'"', 500, true);
			}
		}

		$this->_errors[] = $message;
		$this->api->output->status($code);

		if ($fatal) {
			$this->api->output->send();
		}
	}


	function getErrors () {
		return $this->_errors;
	}


	function valid () {
		return empty($this->_errors);
	}
}