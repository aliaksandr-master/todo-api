<?php



abstract class ApiAbstract {


	/** @var array */
	protected $_errors = array();


	/** @var Api */
	protected $api;


	public function check () {
		return $this->valid();
	}


	function error ($message = null, $status = 500, $fatal = false, $debugArgs = array()) {
		if (is_null($message)) {
			$message = ApiUtils::getMessageByStatus($status);
			if (is_null($message)) {
				trigger_error('UNDEFINED STATUS CODE "'.$status.'"', E_USER_ERROR);
			}
		}

		if (MODE >= DEV) {
			if (!is_array($debugArgs)) {
				$debugArgs = array($debugArgs);
			}
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
		$this->api->output->status($status);

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