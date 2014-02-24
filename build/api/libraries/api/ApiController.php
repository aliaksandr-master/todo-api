<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class ApiController extends BaseController {

    /** @var UserModel */
    public $user;

    /** @var string */
    public $actionName;

    /** @var Api */
    protected $api = null;

    public function __construct () {

        parent::__construct();
        $this->user = UserModel::instance();
    }

    public function _remap ($object_called, $arguments) {
        $this->api = Api::instanceBy($this, $_SERVER["REQUEST_METHOD"], $_SERVER["REQUEST_URI"], $arguments);
        $this->api->launch($object_called, $arguments);
    }

    function input($name = null, $default = null){
        return $this->api->input->get($name, $default);
    }

    protected function _fire_method ($call, $arguments) {

        $actionName = $call[1];

        $this->api->check($actionName, $this->_args, $arguments, $_GET);

        // parent::_fire_method
        $result = call_user_func_array($call, $arguments);
        if (isset($result)) {
            $this->api->output->data($result);
        }
        $this->api->output->send();
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

    /**
     * Response
     *
     * Takes pure data and optionally a status code, then creates the response.
     *
     * @param array $data
     * @param null|int $http_code
     */
    function response ($sendData) {
        exit($sendData);
    }

}