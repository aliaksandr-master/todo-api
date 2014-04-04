<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class BaseController extends CI_Controller implements IApiController {

    /** @var CI_Loader */
    public $load;

	/** @var UserModel */
	public $user;

	/** @var Api */
	protected $api = null;

	public function __construct () {
		parent::__construct();
		// base constructor
		$this->user = UserModel::instance();
	}

	public function _remap ($object_called, $arguments) {

		$url = str_replace(API_ROOT_URL, '', $_SERVER['REQUEST_URI']);

		$this->api = new Api($_SERVER["REQUEST_METHOD"], $url, array(
			'controller' => $this,
			'action' => $object_called
		), array(
			'body' => INPUT_DATA,
			'args' => $arguments,
			'query' => array(),
			'headers' => getallheaders(),
			'ip' => $_SERVER['REMOTE_ADDR'],
			'ssl' => ApiUtils::get($_SERVER, 'HTTPS') === 'on',
			'scheme' => ApiUtils::get($_SERVER, 'REQUEST_SCHEME'),
			'port' => ApiUtils::get($_SERVER, 'SERVER_PORT'),
			'debug/start_timestamp' => defined('START_TIMESTAMP') ? START_TIMESTAMP : gettimeofday(true)
		));

		$this->api->launch();
		$this->api->send(true);
	}

	function compileMethodName ($action, $method, $methodAliasesMap, $responseType) {
		if ($action === 'index') {
			$action = '';
		}
		$action = strtoupper(ApiUtils::get($methodAliasesMap, $method, $method)).'_'.strtoupper($responseType).($action || strlen($action) ? '_'.$action : '');
		return $action;
	}

	function hasAuth () {
		return $this->user->isLogged();
	}

	function callMethod ($actionName) {
		$call = array($this, $actionName);
		return call_user_func_array($call, $this->api->getLaunchParam('input/args'));
	}

	function input ($name = null, $default = null) {
		return $this->api->input->get($name, $default);
	}

	public function hasAccess($method, $controllerName, $actionName){
		$handler = strtolower($controllerName)."#".$actionName;

		$callName = strtoupper($method).":".$handler;
		$callNameAny = "ANY:".$handler;

		// TODO: must use ACCESS MODEL and USER MODEL to create Access-array
		$accesses = array();

		if(isset($accesses[$callNameAny]) && !$accesses[$callNameAny]){
			return false;
		}
		if(isset($accesses[$callName]) && !$accesses[$callName]){
			return false;
		}
		return true;
	}

	public function prepareStatusByMethod ($status, $response, $method) {

		$hasData = !empty($response['data']);

		if ($method == "POST") {
			if ($hasData) {
				return 201; // created new element
			} else {
				return 404; // empty GET result
			}
		} else if ($method == "PUT") {
			if($hasData){
				return 200; // updated resource
			}else{
				return 500; // empty GET result
			}
		} else if ($method == "GET") {
			if (!$hasData) {
				return 404;
			}
		} else if ($method == "DELETE") {
			if(!$hasData){
				return 500; // you must send Boolean response
			}
		}

		return $status;
	}

	public function applyValidationRule ($value, $ruleName, $params, $contextName) {
		$method = '_rule__'.$ruleName;
		if (method_exists($this->api->context, $method)) {
			return $this->api->context->$method($value, $params, $contextName);
		}
		return null;
	}

	public function applyFilter ($value, $filterName, $params, $contextName) {
		$method = '_filter__'.$filterName;
		if (method_exists($this->api->context, $method)) {
			return $this->api->context->$method($value, $params, $contextName);
		}
		return null;
	}

	public function toType ($value, $type, $param = null) {
		switch ($type) {
			case 'decimal':
			case 'integer':
				return intval(trim((string) $value));
			case 'float':
				return floatval(trim((string) $value));
			case 'boolean':
				return (bool) $value;
		}
		return trim((string) $value); // default type = string
	}


}

