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

	protected $_componentsMap = array(
		'access' => 'ApiComponent',
		'filter' => 'ApiFilter',
		'validation' => 'ApiValidation',
		'input' => 'ApiInput',
		'output' => 'ApiOutput'
	);

	protected $apiData = array();

	protected $_params = array();

	protected $_stackTrace = array();

	protected $_specName = null;

	protected $_configs = array();

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


	function __construct ($method, $uri, array $params = array()) {
		$this->api = $this;

		// INIT CONFIG
		$this->_configs['methods'] = include(VAR_DIR.DS.'configs'.DS.sha1('methods').'.php');

		// NEW COMPONENTS
		foreach ($this->_componentsMap as $componentName => $Component) {
			$this->_components[$componentName] = $this->$componentName = new $Component($this);
		}

		// SAVE INIT PARAMS
		if (!preg_match('/^'.implode('|', array_keys($this->config('methods'))).'$/i', $method)) {
			$this->error(400, true, array($method));
		}

		$this->_params['method']        = strtoupper($method);

		// todo: change to PATH key
		$this->_params['uri']           = preg_replace('/^([^\?]+)\?(.*)$/', '$1', $uri);
		$this->_params['search']        = preg_replace('/^([^\?]+)\?(.*)$/', '$2', $uri);

		$this->_params['input/body']    = ApiUtils::get($params, 'input/body',    array());
		$this->_params['input/args']    = ApiUtils::get($params, 'input/args',    array());
		$this->_params['input/query']   = ApiUtils::get($params, 'input/query',   array());
		$this->_params['input/headers'] = ApiUtils::get($params, 'input/headers', array());

		$cellName = $this->getSpecName($this->_params['method'], $this->_params['uri'], $this->_params['input/args']);

		$this->trace('Create spec name', $cellName);

		$apiFile = VAR_DIR.DS.'system'.DS.sha1($cellName).'.php';

		if (is_file($apiFile)) {
			$this->apiData = include($apiFile);
		}
	}

	public function config ($name, $default = null, $strict = true) {
		if ((!is_null($default) || $strict) && !isset($this->_configs[$name])) {
			$this->error('Eternal Server Error', 500, true);
		}
		return ApiUtils::get($this->_configs, $name, $default);
	}


	public function param ($name) {
		return $this->_params[$name];
	}


	public function getLaunchParams () {
		return $this->_params;
	}


	protected function getSpecName ($method, $uriCall, array $arguments) {
		if (is_null($this->_specName)) {
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
			$this->_specName = $method.":".$uriCall;
		}

		return $this->_specName;
	}


	function launch ($controller, $action) {

		$this->_params['launch_timestamp'] = gettimeofday(true);

		$this->context = $this->_params['controller'] = $controller;
		$this->_params['action'] = $action;

		$this->trace('Launch width  '.get_class($controller).'->'.$action);

		if (!$this->apiData) {
			$this->error('Method %0% Not Allowed', 405, true, array (
				'(\''.$this->param('action').'\')',
			));
			return null;
		}


		$response = $this->api->getSpec('response');
		$this->_params['action_to_call'] = $this->context->compileMethodName($this->param('action'), $this->param('method'), $response['type'], $this->config('methods'));

		$this->trace('Compile launch method name', $this->param('action_to_call'));

		if (!method_exists($this->context, $this->param('action_to_call'))) {
			$this->error('Method %0% Not Allowed', 405, true, array (
				'(\''.$this->param('action_to_call').'\')',
			));
			return null;
		}

		foreach ($this->_components as $componentName => $component) {
			$this->trace('Init component', $componentName);
			/** @var ApiComponent $component */
			$component->init();
		}


		foreach ($this->_components as $componentName => $component) {
			$this->trace('Check component', $componentName);
			/** @var ApiComponent $component */
			$component->check();
		}

		if (!$this->valid()) {
			return null;
		}

		$hasAccess = $this->api->context->hasAccess($this->access, $this->getSpec('access'), $this->param('method'), $this->param('action'), $this->param('action_to_call'));
		$this->trace('Has Access', $hasAccess);
		if (!$hasAccess) {
			if ($this->access->valid()) {
				$this->access->error(null, 403);
			}
			return null;
		}

		if (!$this->valid()) {
			return null;
		}

		foreach ($this->_components as $componentName => $component) {
			$this->trace('BeforeActionCall component', $componentName);
			/** @var ApiComponent $component */
			$component->beforeActionCall();
		}

		if ($this->valid()) {
			$actionMethod = $this->param('action_to_call');
			$call = array($this->context, $actionMethod);
			$callArgs = $this->context->getActionArgs($this->param('action'), $this->param('method'), $actionMethod, $this->input);

			$this->trace('Call controller method \''.$actionMethod.'\' with ', $callArgs);

			$result = call_user_func_array($call, $callArgs);

			$this->trace('Result call', $result);

			if (!is_null($result)) {
				$this->api->output->data($result);
			}
		}

		return $this->api->output->compile();
	}


	public function send ($compress) {
		$this->api->output->send($compress);
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

	function trace ($markName, $data = null) {
		if (Api::DEBUG_MODE) {
			if (!is_object($data) && !is_array($data) && !is_null($data)) {
				if (is_bool($data)) {
					$data = $data ? 'true' : 'false';
				}
				$markName .= ': '.$data;
				$data = null;
			}
			if (is_null($data)) {
				$this->_stackTrace[] = $markName;
			} else {
				$this->_stackTrace[][$markName] = $data;
			}
		}
	}


	function getStackTrace () {
		if (Api::DEBUG_MODE) {
			return $this->_stackTrace;
		}
		return array();
	}


	function getSpec ($name = null, $default = null) {
		if (is_null($name)) {
			return $this->apiData;
		}

		return isset($this->apiData[$name]) ? $this->apiData[$name] : $default;
	}
}