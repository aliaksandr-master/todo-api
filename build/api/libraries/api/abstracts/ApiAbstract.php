<?php



abstract class ApiAbstract {


	/** @var array */
	protected $_errors = array();


	/** @var Api */
	protected $api;


	public function check () {
		return $this->valid();
	}


	function error ($message = null, $code = 500, $fatal = false, array $debugArgs = array()) {
		if (is_null($message)) {
			$message = ApiUtils::getMessageByCode($code);
			if (is_null($message)) {
				$this->api->error('UNDEFINED STATUS CODE "'.$code.'"', 500, true);
			}
		}

		if (Api::DEBUG_MODE) {
			foreach ($debugArgs as $key => $value) {
				if (strpos('%'.$key.'%', $message)) {
					$message .= ' %'.$key.'%';
				}
			}
			foreach ($debugArgs as $argKey => $argVal) {
				$argVal = json_encode($argVal);
				$argVal = str_replace('"', '', $argVal);
				$message = str_replace('%'.$argKey.'%', $argVal, $message);
			}
		} else {
			$message = preg_replace("/(\%[^\%]+\%)/", '', $message);
			$message = preg_replace('/\s+/', ' ', $message);
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


	protected function getSpec ($name, $default) {
		return $this->api->getSpec($name, $default);
	}
}