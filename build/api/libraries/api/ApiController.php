<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class ApiController extends REST_Controller {

    /**
     * @var UserModel
     */
    public $user;
    /**
     * @var Api
     */
    protected $api = null;

    public function __construct(){
        parent::__construct();
        $this->user = UserModel::instance();
    }

    function input($name = null, $default = null){
        return $this->api->input->get($name, $default);
    }

    protected function _fire_method ($call, $arguments) {
        $this->api = Api::instanceBy($this, $_SERVER["REQUEST_METHOD"], $_SERVER["REQUEST_URI"], $arguments);

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

    /*---------------------------------------------- FILTERS ----------------------------*/

    function _filter__xss ($value, $params = array(), $name) {
        return $value;
    }

    function _filter__trim ($value, $params = array(), $name) {
        return trim((string)$value);
    }


    /*---------------------------------------------- VALIDATION RULES ----------------------------*/

    function _rule__required ($value, array $params = array(), $name = null) {
        return isset($value) && strlen((string) $value);
    }

    function _rule__need ($value, array $params = array(), $name = null) {
        $existFiled = $params[0];
        return $this->_rule__required($this->input($existFiled), array($existFiled), $name);
    }

    function _rule__matches ($value, array $params = array(), $name = null) {
        $matchFieldName = $params[0];
        return (bool) ($value === $this->input($matchFieldName, null));
    }

    function _rule__min_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')) {
            return !(mb_strlen($value) < $length);
        }
        return !(strlen($value) < $length);
    }

    function _rule__max_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return !(mb_strlen($value) > $length);
        }
        return !(strlen($value) > $length);
    }

    function _rule__exact_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return (bool) (mb_strlen($value) == $length);
        }
        return (bool) (strlen($value) == $length);
    }

    function _rule__valid_email ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
    }

    function _rule__alpha ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z])+$/i", $value);
    }

    function _rule__alpha_numeric ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z0-9])+$/i", $value);
    }

    function _rule__alpha_dash ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
    }

    function _rule__numeric ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?\d*\.?\d+$/', $value);
    }

    function _rule__integer ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?\d+$/', $value);
    }

    function _rule__decimal ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^\d+$/', $value);
    }

    function _rule__is_natural ($value, array $params = array(), $name = null) {
        return (bool) preg_match( '/^[0-9]+$/', $value);
    }

    function _rule__float ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?$/', $value);
    }

    function _rule__is_natural_no_zero ($value, array $params = array(), $name = null) {
        return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
    }

    function _rule__valid_base64 ($value, array $params = array(), $name = null) {
        return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
    }

    function _rule__valid_url ($value, array $params = array(), $name = null) {
        return filter_var($value, FILTER_VALIDATE_URL);
    }

    function _rule__valid_date ($value, array $params = array(), $name = null) {
        $stamp = strtotime($value);
        if (is_numeric($stamp)) {
            return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
        }
        return false;
    }

}