<?php



class Api extends ApiAbstract {

	const MODE_DEV_LEVEL = 3;

	public $debugMode = 0;


	/** @var array */
	protected $_errors = array();

	/** @var IApiResourceController */
	public $context;

	/** @var Api */
	public $api;

	/** @var ApiRequest */
	public $request;

	/** @var ApiResponse */
	public $response;

	protected $_components = array();

	protected $_componentsMap = array(
		'request'  => 'ApiRequest',
		'response' => 'ApiResponse'
	);

	private $_apiData = array();

	protected $_params = array();

	protected $_stackTrace = array();

	protected $_configs = array();

	public $mimes = array();

	public $statuses = array();

	public $timers = array();


	function __construct (array $params, array $options) {

		set_error_handler(array($this, 'error_handler'));

		// CREATE COMPONENTS
		foreach ($this->_componentsMap as $componentName => $Component) {
			$this->_components[$componentName] = $this->$componentName = new $Component($this);
		}

		// INIT PARAMS
		$this->debugMode = ApiUtils::get($params, 'debug', false);

		// INIT OPTIONS
		$this->mimes = ApiUtils::get($options, 'mimes', array());
		$this->statuses = ApiUtils::get($options, 'statuses', array());
	}


	function error ($type, $reason = null, $status = 500, $fatal = false) {
		if (is_null($reason)) {
			$reason = $this->response->getMessageByStatus($status);
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

		$this->api->response->status($status);

		if ($fatal) {
			$this->api->response->clear();
			$this->api->response->freeze();
		}
	}


	public function _configureComponents ($name, $method, $uri, array $params) {
		foreach ($this->_components as $componentName => $component) {
			$this->trace('configure component', $componentName);
			/** @var ApiAbstractComponent $component */
			$component->_configure($name, $method, $uri, $params);
		}
	}


	public function _configure ($name, $method, $uri, array $params) {

		$this->api = $this;

		$this->trace('Spec name', $name);

		$apiFile = VAR_DIR.DS.'specs'.DS.sha1($name).'.php';

		$this->_apiData = is_file($apiFile) ? include($apiFile) : array();

		$this->timers['action'] = 0;
	}

	function error_handler () {
		dump(func_get_args());
	}

	function run ($name, $method, $uri, array $params) {

		$this->_configure($name, $method, $uri, $params);


		$this->timers['launch'] = gettimeofday(true);

		if (!$this->_apiData) {
			$this->systemError(null, 405);
			return $this->response->compile();
		}

		$this->request->action = $this->getSpec('action');

		$this->trace('Launch width  '.$this->getSpec('controller').'->'.$this->request->action);

		$Controller = $this->getSpec('controller');
		$this->context = new $Controller($this);

		$this->_configureComponents($name, $method, $uri, $params);

		if ($this->valid()) {

			$this->trace('Call controller method', $this->request->action);

			$timerAction = gettimeofday(true);
			$result = $callArgs = $this->context->resource($this->request->action);
			$this->timers['action'] = gettimeofday(true) - $timerAction;

			$this->trace('Has call data', !empty($result));


			if (!is_null($result)) {
				$this->response->data($result);
			}
		} else {
			$this->response->clear();
		}

		return $this->response->compile();
	}

	function __destruct () {
		restore_error_handler();
	}

	function getErrors () {
		return $this->_errors;
	}


	function valid () {
		return !$this->_errors && $this->response->getSuccessByStatus($this->response->status());
	}


	function trace ($markName, $data = null) {
		if ($this->debugMode) {
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
		return $this->_stackTrace;
	}


	function getSpec ($name = null, $default = null) {
		return ApiUtils::getArr($this->_apiData, $name, $default);
	}
}