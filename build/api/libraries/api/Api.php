<?php

$apiAvl = ENVIRONMENT === "development" || ENVIRONMENT === "testing";
define('_API_TESTING_MODE_', $apiAvl && !empty($_GET['_testing']));
define('_API_DEBUG_MODE_', _API_TESTING_MODE_ || ($apiAvl && !empty($_GET['_debug'])));



class Api extends ApiAbstract {

	const TEST_MODE = _API_TESTING_MODE_;

	const DEBUG_MODE = _API_DEBUG_MODE_;

	const REQUEST_URI_ROOT = API_ROOT_URL; // '/server'

	const NAME = 'name';

	const ERROR_CELL = 'system';

	const VERSION = 'version';

	const URL = 'url';

	const RESPONSE = 'response';

	const REQUEST = 'request';

	const ACCESS = "access";

	const TYPE_TEXT = 'text';

	const TYPE_DECIMAL = 'decimal';

	const TYPE_STRING = 'string';

	const TYPE_INTEGER = 'integer';

	const TYPE_FLOAT = 'float';

	const TYPE_BOOLEAN = 'boolean';

	private static $_singletons = array();

	/** @var string */
	public $actionName;

	/** @var array */
	public $arguments;

	/** @var ApiController */
	public $context;

	/** @var Api */
	public $api;

	/** @var ApiInput */
	public $input;

	/** @var ApiOutput */
	public $output;

	/** @var ApiAccess */
	public $access;

	/** @var ApiServer */
	public $server;

	/** @var ApiFilter */
	public $filter;

	/** @var ApiFormat */
	public $format;

	/** @var ApiValidation */
	public $validation;

	public $errorPref = 'Api ';

	protected $_parts = array();

	public $apiData = array();

	public $methodsMap = array();

	private $_launched = false;

	function __construct (array $apiData, ApiController &$context, array $methodsMap) {

		$this->apiData = $apiData;

		$this->methodsMap = $methodsMap;

		$this->api = $this;
		$this->context = $context;

		$this->errorPref .= $this->get(Api::NAME).': ';
	}


	private function _initParts () {
		foreach ($this->_parts as $part) {
			/** @var ApiPartAbstract $part */
			$part->init();
		}
	}


	private function _checkParts () {
		foreach ($this->_parts as $part) {
			/** @var ApiPartAbstract $part */
			$part->check();
		}
	}


	private function _prepareParts () {
		foreach ($this->_parts as $part) {
			/** @var ApiPartAbstract $part */
			$part->prepare();
		}
	}


	protected function &_part ($name, &$part) {
		$this->_parts[$name] = & $part;

		return $part;
	}


	function launch ($actionName, $arguments) {

		if ($this->_launched) {
			throw new Exception("api mustn't exec twice");
		}
		$this->_launched = true;

		$this->api->arguments = $arguments;

		$this->input = $this->_part('input', new ApiInput($this));
		$this->filter = $this->_part('filter', new ApiFilter($this));
		$this->output = $this->_part('output', new ApiOutput($this));
		$this->access = $this->_part('access', new ApiAccess($this));
		$this->validation = $this->_part('validation', new ApiValidation($this));
		$this->format = $this->_part('format', new ApiFormat($this));
		$this->server = $this->_part('server', new ApiServer($this));

		$response = $this->api->get(self::RESPONSE);

		if ($actionName) {
			$actionName = '_'.$actionName;
		}

		$methodRew = ApiUtils::get($this->methodsMap, strtoupper($this->api->server->method), $this->api->server->method);

		$this->api->actionName = strtoupper($methodRew).'_'.strtoupper($response['type']).$actionName;

		$this->_initParts();

		// Sure it exists, but can they do anything with it?
		if (!method_exists($this->context, $this->api->actionName) || !$this->apiData) {
			$this->error('Method Not Allowed', 405, true);
			return;
		}

		$call = array($this->context, $this->api->actionName);

		$this->api->_checkParts();
		$this->api->_prepareParts();

		$result = call_user_func_array($call, $arguments);

		if (isset($result)) {
			$this->api->output->data($result);
		}

		$this->api->output->send();
	}


	function getErrors () {
		$errors = array();
		foreach ($this->_parts as $name => $part) {

			/** @var ApiPartAbstract $part */

			$err = $part->getErrors();
			if (!empty($err)) {
				$errors[$name] = $err;
			}
		}

		$err = parent::getErrors();
		if (!empty($err)) {
			$errors[self::ERROR_CELL] = $err;
		}

		return $errors;
	}


	function valid () {

		$vars = get_object_vars($this);

		foreach ($vars as $var) {
			if ($var instanceof ApiPartAbstract) {
				if (!$var->valid()) {
					return false;
				}
			}
		}

		if ($this->getErrors()) {
			return false;
		}

		return true;
	}


	function get ($name = null, $default = null) {
		if (is_null($name)) {
			return $this->apiData;
		}

		return isset($this->apiData[$name]) ? $this->apiData[$name] : $default;
	}


	/**
	 * @param ApiController $context
	 * @param string        $method
	 * @param string        $uriCall
	 * @param array         $arguments
	 *
	 * @return Api
	 */
	static function instanceBy (ApiController &$context, $method, $uriCall, array $arguments = array()) {

		$parsedFile = VAR_DIR.DS."api.parsed.json";

		$method = strtoupper($method);
		if (is_null($uriCall)) {
			$uriCall = $_SERVER["REQUEST_URI"];
		}
		$uriCall = str_replace(self::REQUEST_URI_ROOT.'/', '', $uriCall); // TODO: remove valid base URI
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

		// CELL NAME
		$cellName = $method.":".$uriCall;

		if (!empty(self::$_singletons[$cellName])) {
			return self::$_singletons[$cellName];
		}

		$apiData = array();

		$apiFile = VAR_DIR.DS.'system'.DS.sha1($cellName).'.php';
		if (is_file($apiFile)) {
			$apiData = include($apiFile);
		}

		$methodsFile = VAR_DIR.DS.'system'.DS.sha1('methods').'.php';
		$methods = array();
		if (is_file($methodsFile)) {
			$methods = include($methodsFile);
		}

		self::$_singletons[$cellName] = new Api($apiData, $context, $methods);

		return self::$_singletons[$cellName];
	}
}