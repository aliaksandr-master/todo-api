<?php

class IntercessorError extends IntercessorAbstractComponent {

	/** @var array */
	protected $_errors = array();


	function system ($reason = null, $status = 500) {
		$this->set('system', $reason, $status, true);
	}


	function content ($reason = null, $status) {
		$this->set('content', $reason, $status, true);
	}


	function inputData (array $array) {
		$this->set('input', $array, 400, true);
	}


	function inputField ($fieldName, $reason, array $params = array()) {
		$this->set('input', array(
			$fieldName => array(
				$reason => $params
			)
		), 400, true);
	}

	function get () {
		return $this->_errors;
	}


	function set ($type, $reason = null, $status = 500, $fatal = false) {
		if (is_null($reason)) {
			$reason = $this->kernel->response->getMessageByStatus($status);
			if (is_null($reason)) {
				trigger_error('UNDEFINED STATUS CODE "'.$status.'"', E_USER_ERROR);
			}
		}

		if (is_array($reason)) {
			foreach ($reason as $key => $res) {
				if (is_numeric($key)) {
					$this->_errors[$type][] = $res;
				} else {
					$this->_errors[$type][$key] = $res;
				}
			}
		} else {
			$this->_errors[$type][] = $reason;
		}

		$this->kernel->response->status($status);

		if ($fatal) {
			$this->kernel->response->clear();
			$this->kernel->response->freeze();
		}
	}

	function _setHandler () {
		set_error_handler(array($this, '_error_handler'));
	}

	function _restoreHandler () {
		set_error_handler(array($this, 'error_handler'));
	}

	function _error_handler () {
		restore_error_handler();
	}

}