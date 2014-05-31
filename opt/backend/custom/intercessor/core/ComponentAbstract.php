<?php

namespace Intercessor;

/**
 * Class ComponentAbstract
 * @package Intercessor
 */
abstract class ComponentAbstract extends EventBroker {

	/**
	 * @var Environment
	 */
	protected $env;

	/**
	 * @var Request
	 */
	protected $request;

	/**
	 * @var Response
	 */
	protected $response;


	private $_init = false;


	public function publish ($eventName, array $params = array()) {
		$r = parent::publish($eventName, $params);
		$this->env->trace(str_replace('\\', '', get_class($this)).' event \''.$eventName.'\'', $params);
		return $r;
	}

	/**
	 * @param Environment $env
	 * @param Request     $request
	 * @param Response    $response
	 */
	function _init (Environment &$env, Request &$request, Response &$response) {
		if ($this->_init) {
			trigger_error('multiple init');

			return;
		}

		$this->_init = true;

		$this->env = $env;
		$this->request = $request;
		$this->response = $response;
	}


	/**
	 * @return bool
	 */
	function valid () {
		if ((bool) $this->request->getErrors()) {
			return false;
		}
		if (!$this->response->success()) {
			return false;
		}
		if (!$this->request->spec()) {
			return false;
		}

		return true;
	}


	/** @var array */
	protected $_errors = array();

	private $_initHandler = false;


	function fatalError ($reason = null, $status = 500) {
		$this->newError('system', $reason, $status, true);

		return $this;
	}


	function contentError ($reason = null, $status) {
		$this->newError('content', $reason, $status, true);

		return $this;
	}


	function inputDataError (array $array) {
		$this->newError('input', $array, 400, true);

		return $this;
	}


	function formatError ($reason) {
		$this->newError('format', $reason, 400, true);

		return $this;
	}


	function inputFieldError ($fieldName, $reason, array $params = array()) {
		$this->newError('input', array(
			$fieldName => array(
				$reason => $params
			)
		), 400, true);

		return $this;
	}


	function getErrors ($selfOnly = false) {
		if ($selfOnly) {
			return $this->_errors;
		}
		$requestErrors = $this->request->getErrors(true);
		$responseErrors = $this->response->getErrors(true);
		return array_merge($requestErrors, $responseErrors);
	}


	function newError ($type, $reason = null, $status = 500, $fatal = false) {

		if (is_null($reason)) {
			$reason = Utils::get(Utils::get($this->env->statuses, $status, array()), 'message', null);
		}

		$this->publish('error', array(
			'type' => $type,
			'reason' => $reason,
			'status' => $status,
			'fatal' => $fatal
		));

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

		$this->response->status($status);

		if ($fatal) {
			$this->response->clear();
			$this->response->freeze();
		}
	}


	function _setErrorHandler () {
		if ($this->_initHandler || !$this->env->error_handler) {
			return;
		}
		$this->_initHandler = true;
		set_error_handler(array($this, '_errorHandler'));
	}


	protected function _restoreErrorHandler () {
		if (!$this->_initHandler) {
			return;
		}
		$this->_initHandler = false;
		restore_error_handler();
	}


	public function _errorHandler () {
		$this->env->trace('Internal Server Error', func_get_args());
		$this->fatalError('Internal Server Error');
	}


	function __destruct () {
		$this->_restoreErrorHandler();
	}
}