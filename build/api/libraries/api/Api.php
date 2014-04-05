<?php

$apiAvl = ENVIRONMENT === "development" || ENVIRONMENT === "testing";
define('_API_TESTING_MODE_', $apiAvl && !empty($_GET['_testing']));
define('_API_DEBUG_MODE_', _API_TESTING_MODE_ || ($apiAvl && !empty($_GET['_debug'])));



class Api extends ApiAbstract {

	const TEST_MODE = _API_TESTING_MODE_;

	const DEBUG_MODE = _API_DEBUG_MODE_;

	/** @var IApiController */
	public $context;

	/** @var Api */
	public $api;

	/** @var ApiInput */
	public $input;

	/** @var ApiOutput */
	public $output;

	/** @var ApiComponent */
	public $access;

	/** @var ApiFilter */
	public $filter;

	/** @var ApiValidation */
	public $validation;

	protected $_components = array();

	public $apiData = array();

	public $methodsMap = array();

	private $_launched = false;

	private $_launchParams = array();


	public $formats = array(
		'xml'  => array(
			'inputMimes' => array(
				'xml',
				'application/xml',
				'text/xml'
			),
			'outputMime' => 'application/xml'
		),
		'json' => array(
			'inputMimes' => array(
				'json',
				'application/json'
			),
			'outputMime' => 'application/json'
		),
		'jsonp' => array(
			'inputMimes' => array(
				'jsonp',
				'application/javascript'
			),
			'outputMime' => 'application/javascript'
		),
		'form' => array(
			'inputMimes' => array(
				'application/x-www-form-urlencoded'
			),
			'outputMime' => 'application/x-www-form-urlencoded'
		)
	);


	function __construct ($method, $uri, array $callParams = array(), array $inputData = array()) {
		$this->api = $this;

		$this->_launchParams['method'] = strtoupper($method);

		if (!preg_match('/^GET|HEAD|OPTIONS|POST|PUT|DELETE|TRACE|PATCH$/', $this->_launchParams['method'])) {
			throw new Exception('invalid method name "'.$method.'" !');
		}

		// todo: change to PATH key
		$this->_launchParams['uri'] = preg_replace('/^([^\?]+)\?(.*)$/', '$1', $uri);
		$this->_launchParams['search'] = preg_replace('/^([^\?]+)\?(.*)$/', '$2', $uri);

		$this->_launchParams['input/body'] = ApiUtils::get($inputData, 'body', array());
		$this->_launchParams['input/args'] = ApiUtils::get($inputData, 'args', array());
		$this->_launchParams['input/query'] = ApiUtils::get($inputData, 'query', array());
		$this->_launchParams['input/headers'] = ApiUtils::get($inputData, 'headers', array());

		$this->_launchParams['controller'] = ApiUtils::get($callParams, 'controller', null);
		$this->_launchParams['action'] = ApiUtils::get($callParams, 'action', null);

		$this->_launchParams['uri_insensitive_case'] = ApiUtils::get($callParams, 'uri_insensitive_case', false);

		if ($this->_launchParams['uri_insensitive_case']) {
			$this->_launchParams['uri'] = strtolower($this->_launchParams['uri']);
		}

		$cellName = $this->_compileCellName($this->_launchParams['method'], $this->_launchParams['uri'], $this->_launchParams['input/args']);

		$apiData = array();
		$methodsMap = array();

		$apiFile = VAR_DIR.DS.'system'.DS.sha1($cellName).'.php';
		$methodsFile = VAR_DIR.DS.'system'.DS.sha1('methods').'.php';

		if (is_file($apiFile)) {
			$apiData = include($apiFile);
		}
		if (is_file($methodsFile)) {
			$methodsMap = include($methodsFile);
		}

		$this->apiData = $apiData;
		$this->methodsMap = $methodsMap;

		$this->context = $this->_launchParams['controller'];

		$response = $this->api->getSpec('response');

		$this->_launchParams['action_to_call'] = $this->context->compileMethodName($this->_launchParams['action'], $this->_launchParams['method'], $response['type'], $this->methodsMap);
	}


	public function getLaunchParam ($name) {
		return $this->_launchParams[$name];
	}


	public function getLaunchParams () {
		return $this->_launchParams;
	}


	protected function _compileCellName ($method, $uriCall, array $arguments) {
		$uriCall = preg_replace('/\?(.+)$/', '', $uriCall);
		$uriCall = str_replace('\\', '/', $uriCall);
		$uriCall = preg_replace('#(/+)$#', '', $uriCall);

		if ($arguments) {
			$implArgs = implode('|', $arguments);
			$uriCall = preg_replace('#^('.$implArgs.')$#', '<param>', $uriCall);
			$uriCall = preg_replace('#^('.$implArgs.')/#', '<param>/', $uriCall);
			$uriCall = preg_replace('#/('.$implArgs.')/#', '/<param>/', $uriCall);
			$uriCall = preg_replace('#/('.$implArgs.')$#', '/<param>', $uriCall);
		}

		$uriCall = preg_replace('/^\/+/i', '', $uriCall);
		$cellName = $method.":".$uriCall;

		return $cellName;
	}


	function launch () {
		if ($this->_launched) {
			return null;
		}
		$this->_launched = true;

		$this->_launchParams['launch_timestamp'] = gettimeofday(true);

		if (!$this->apiData || !method_exists($this->context, $this->getLaunchParam('action_to_call'))) {
			$this->error('Method Not Allowed', 405, true);

			return null;
		}

		$this->setComponent('access', new ApiComponent($this));
		$this->setComponent('filter', new ApiFilter($this));
		$this->setComponent('validation', new ApiValidation($this));

		$this->setComponent('input', new ApiInput($this));
		$this->setComponent('output', new ApiOutput($this));

		foreach ($this->_components as $component) {
			/** @var ApiComponent $component */
			$component->check();
		}

		if (!$this->valid()) {
			return null;
		}

		$hasAccess = $this->api->context->hasAccess($this->access, $this->getSpec('access'), $this->getLaunchParam('method'), $this->getLaunchParam('action'), $this->getLaunchParam('action_to_call'));
		if (!$hasAccess) {
			if ($this->access->valid()) {
				$this->access->error(null, 403);
			}
			return null;
		}

		if (!$this->valid()) {
			return null;
		}

		foreach ($this->_components as $part) {
			/** @var ApiComponent $part */
			$part->beforeActionCall();
		}

		if ($this->valid()) {
			$actionMethod = $this->getLaunchParam('action_to_call');
			$call = array($this->context, $actionMethod);
			$callArgs = $this->context->getActionArgs($this->getLaunchParam('action'), $this->getLaunchParam('method'), $actionMethod, $this->input);
			$result = call_user_func_array($call, $callArgs);

			if (!is_null($result)) {
				$this->api->output->data($result);
			}
		}

		return $this->api->output->compile();
	}


	public function send ($compress) {
		$this->api->output->send($compress);
	}


	protected function &setComponent ($name, &$part) {
		$this->$name = $part;
		$this->_components[$name] = & $part;

		return $part;
	}


	function getErrors () {
		$errors = array();
		foreach ($this->_components as $name => $part) {

			/** @var ApiComponent $part */

			$err = $part->getErrors();
			if (!empty($err)) {
				$errors[$name] = $err;
			}
		}
		$err = parent::getErrors();
		if (!empty($err)) {
			$errors['system'] = $err;
		}

		return $errors;
	}


	function valid () {
		foreach ($this->_components as $component) {
			/** @var ApiComponent $component */
			if (!$component->valid()) {
				return false;
			}
		}
		if ($this->getErrors() || $this->output->status() >= 400) {
			return false;
		}

		return true;
	}


	function getSpec ($name = null, $default = null) {
		if (is_null($name)) {
			return $this->apiData;
		}

		return isset($this->apiData[$name]) ? $this->apiData[$name] : $default;
	}
}