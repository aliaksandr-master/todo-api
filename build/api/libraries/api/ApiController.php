<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class ApiController extends CI_Controller {

    /** @var UserModel */
    public $user;

    /** @var Api */
    protected $api = null;

    public function __construct () {
        parent::__construct();
        $this->user = UserModel::instance();
    }

    public function _remap ($object_called, $arguments) {
		$query = array();
		parse_str($_SERVER['QUERY_STRING'], $query);

		$url = str_replace(API_ROOT_URL, '', $_SERVER['REQUEST_URI']);

		$this->api = new Api($_SERVER["REQUEST_METHOD"], $url, array(
			'controller' => $this,
			'action' => $object_called
		), array(
			'body' => INPUT_DATA,
			'args' => $arguments,
			'query' => $query,
			'headers' => getallheaders(),
			'ip' => $_SERVER['REMOTE_ADDR']
		));

		$this->api->launch();
    }

	function compileMethodName ($action, $method, $methodAliasesMap, $responseType) {
		if ($action === 'index') {
			$action = '';
		}
		$action = strtoupper(ApiUtils::get($methodAliasesMap, $method, $method)).'_'.strtoupper($responseType).($action || strlen($action) ? '_'.$action : '');
		return $action;
	}

	function callMethod ($actionName) {
		$call = array($this, $actionName);
		return call_user_func_array($call, $this->api->getLaunchParam('input/args'));
	}

    function input ($name = null, $default = null) {
        return $this->api->input->get($name, $default);
    }

    public function hasAccess($method, $controllerName, $actionName){
        $actionName = preg_replace('/_(put|get|delete|option|post|head)$/i', '', $actionName);
        $controllerName = strtolower($controllerName);
        $actionName = strtolower($actionName);
        $method = strtolower($method);
        $callName = $method.":".$controllerName."/".$actionName;
        $callNameAny = "ANY:".$controllerName."/".$actionName;

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

    function response ($sendData) {
        exit($sendData);
    }

}