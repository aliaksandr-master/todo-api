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
		if ($object_called === 'index') {
			$className = get_class($this);
			$className = preg_replace('/(|_?controller$)/i', '', $className);
			$object_called = strtolower($className);
		}
        $this->api = Api::instanceBy($this, $_SERVER["REQUEST_METHOD"], $_SERVER["REQUEST_URI"], $arguments);
        $this->api->launch($object_called, $arguments);
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