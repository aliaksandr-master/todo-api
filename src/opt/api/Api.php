<?php



class Api extends ApiAbstract {

	/** @var IApiController */
	public $context;

	/** @var Api */
	public $api;

	/** @var ApiRequest */
	public $request;

	/** @var ApiResponse */
	public $output;

	/** @var ApiComponent */
	public $access;

	/** @var ApiFilter */
	public $filter;

	/** @var ApiValidation */
	public $validation;

	protected $_components = array();

	protected $_componentsMap = array(
		'access'     => 'ApiComponent',
		'filter'     => 'ApiFilter',
		'validation' => 'ApiValidation',
		'request'    => 'ApiRequest',
		'output'     => 'ApiResponse'
	);

	private $_apiData = array();

	protected $_params = array();

	protected $_stackTrace = array();

	protected $_configs = array();

	public $formats = array(
		'xml'   => array(
			'inputMimes' => array(
				'xml',
				'application/xml',
				'text/xml'
			),
			'outputMime' => 'application/xml'
		),
		'json'  => array(
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
		'form'  => array(
			'inputMimes' => array(
				'application/x-www-form-urlencoded'
			),
			'outputMime' => 'application/x-www-form-urlencoded'
		)
	);


	function __construct ($name, $method, $uri, array $params) {
		$this->api = $this;

		// CREATE COMPONENTS
		foreach ($this->_componentsMap as $componentName => $Component) {
			$this->_components[$componentName] = $this->$componentName = new $Component($this);
		}

		// INIT PARAMS
		$this->setParam('method', strtoupper($method));

		// todo: change to PATH key
		$this->setParam('url/uri', $uri);
		$this->setParam('url/pathname', preg_replace('/^([^\?]+)\?(.*)$/', '$1', $uri));
		$this->setParam('url/search', preg_replace('/^([^\?]+)\?(.*)$/', '$2', $uri));

		foreach (array(
					 'input/body'    => array(),
					 'input/args'    => array(),
					 'input/query'   => array(),
					 'input/headers' => array(),
				 ) as $name => $default) {
			$this->setParam($name, ApiUtils::get($params, $name, $default));
		}

		$this->trace('Spec name', $name);

		$apiFile = VAR_DIR.DS.'specs'.DS.sha1($name).'.php';

		$this->_apiData = is_file($apiFile) ? include($apiFile) : array();
		$this->setParam('time/action', 0);
	}


	public function check () {

		$method = $this->getParam('method');
		if (!preg_match('/^GET|PUT|POST|DELETE|OPTIONS|HEAD|CONNECT|TRACE$/i', $method)) {
			$this->error(400, true, array($method));
		}

		return $this->valid();
	}


	public function config ($name, $default = null, $strict = true) {
		if ((!is_null($default) || $strict) && !isset($this->_configs[$name])) {
			$this->error('Eternal Server Error', 500, true);
		}

		return ApiUtils::get($this->_configs, $name, $default);
	}


	public function getParam ($name) {
		return $this->_params[$name];
	}


	protected function setParam ($name, $value) {
		return $this->_params[$name] = $value;
	}


	function launch () {

		$this->setParam('timer/launch', gettimeofday(true));

		$this->trace('Launch width  '.$this->getParam('controller/class').'->'.$this->getParam('controller/action'));

		if (!$this->_apiData) {
			$this->error('Method %0% Not Allowed', 405, true, array(
				'(\''.$this->getParam('controller/action').'\')',
			));

			return null;
		}

		$response = $this->getSpec('response');
		$this->setParam('actionToCall', $this->context->compileMethodName($this->getParam('controller/action'), $this->getParam('method'), $response['type'], $this->config('methods')));

		$this->trace('Compile launch method name', $this->getParam('actionToCall'));

		if (!method_exists($this->context, $this->getParam('actionToCall'))) {
			$this->error('Method %0% Not Allowed', 405, true, array(
				'(\''.$this->getParam('actionToCall').'\')',
			));

			return null;
		}

		foreach ($this->_components as $componentName => $component) {
			$this->trace('Init component', $componentName);
			/** @var ApiComponent $component */
			$component->beforeLaunch();
		}

		foreach ($this->_components as $componentName => $component) {
			$this->trace('Check component', $componentName);
			/** @var ApiComponent $component */
			$component->check();
		}

		if (!$this->valid()) {
			return null;
		}

		$hasAccess = $this->context->hasAccess($this->access, $this->getSpec('access'), $this->getParam('method'), $this->getParam('action'), $this->getParam('actionToCall'));
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
			$actionMethod = $this->getParam('actionToCall');
			$call = array($this->context, $actionMethod);
			$callArgs = $this->context->getActionArgs($this->getParam('action'), $this->getParam('method'), $actionMethod, $this->request);

			$this->trace('Call controller method \''.$actionMethod.'\' with args ', $callArgs);
			$this->setParam('time/action', gettimeofday(true));

			$result = call_user_func_array($call, $callArgs);

			$this->setParam('time/action', gettimeofday(true) - $this->getParam('time/action'));

			$this->trace('Has call data', !empty($result));

			if (!is_null($result)) {
				$this->output->data($result);
			}
		}

		return $this->output->compile();
	}


	public function send ($compress) {
		$this->output->send($compress);
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
		if ($this->getErrors()) {
			return false;
		}

		return true;
	}


	function trace ($markName, $data = null) {
		if (MODE === DEV) {
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
		if (MODE === DEV) {
			return $this->_stackTrace;
		}

		return array();
	}


	function getSpec ($name = null, $default = null) {
		return ApiUtils::getArr($this->_apiData, $name, $default);
	}
}