<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class ApiController extends REST_Controller {

    /**
     * @var DataTransfer
     */
    private $_transfer = null;
    /**
     * @var Api
     */
    private $_api = null;

    public function __construct(){
        parent::__construct();
        if(is_null($this->_transfer)){
            $this->_transfer = new DataTransfer($this);
        }
    }

    protected $_inputData = array();

    public function api($names = null,  $namesMap = array(), $withoutEmpty = true){
        if(!$namesMap){
            $namesMap = array();
        }
        if (!is_null($names)) {
            return $this->_api->get($names, $namesMap, $withoutEmpty);
        }
        return $this->_api;
    }

    public function input($name = null, $default = null){
        return $this->_api->input($name, $default);
    }

    /**
     * @var array|string $dataName [optional]
     * @var mixed $dataValue [optional]
     * @return DataTransfer
     */
    public function transfer($dataName = null, $dataValue = null){
        if(!is_null($dataName)){
            $this->_transfer->data($dataName, $dataValue);
        }
        return $this->_transfer;
    }

    public function _remap($call, $arguments){
        $currApi = Api::instanceBy($_SERVER["REQUEST_METHOD"], $_SERVER["REQUEST_URI"], $arguments);
        if(empty($currApi)){
            $this->transfer()->error(405);
            $this->_send();
            return;
        }
        if($currApi->hasNeedLogin()){
            $user = new User_model();
            if(!$user->isLogged()){
                $this->transfer()->error(401);
                $this->_send();
                return;
            }
        }
        $this->_api = $currApi;
        $this->_api->context($this);
        parent::_remap($call, $arguments);
    }

    private function _send(){
        // SMART STATUS CODES
        $method  = strtoupper($_SERVER["REQUEST_METHOD"]);
        if (!$this->transfer()->hasError()) {
            if ($method == "POST") {
                if ($this->transfer()->data()->getResult()) {
                    $this->transfer()->code(201); // created new resource
                } else {
                    if(!$this->transfer()->hasError()){
                        $this->transfer()->error(400); // empty GET result
                    }
                }
            }else if($method == "PUT"){
                if($this->transfer()->data()->getResult()){
                    $this->transfer()->code(200); // updated resource
                }else{
                    if(!$this->transfer()->hasError()){
                        $this->transfer()->error(400); // empty GET result
                    }
                }
            }else if($method == "GET"){
                // ONLY 200 or SOMETHING CUSTOM
            }else if($method == "DELETE"){
                // ONLY 200 or SOMETHING CUSTOM
                if(!$this->transfer()->hasError()){
                    if(!$this->transfer()->data()->getResult()){
                        $this->transfer()->error(500); // you must send Boolean response
                    }
                }
            }
        }
        // SEND RESPONSE
        $response = $this->transfer()->getAllData();
        if($this->transfer()->hasError()){
            $response["data"] = array();
        }else{
            if(isset($response["data"])){
                $data = $this->api()->prepareResponseData($response["data"]);
                if(is_null($data)){
                    $response["data"] = array();
                    $this->transfer()->error(404);
                } else {
                    $response["data"] = $data;
                }
            } else {
                $this->transfer()->error(500);
            }
        }
        // DEBUG DATA (only for development or testing mode
        if(ENVIRONMENT == "development" || ENVIRONMENT == "testing"){
            $input = array();
            $input["url"] = $_SERVER['REQUEST_URI'];
            $input["method"] = $method;
            $input["time"] = (round((gettimeofday(true) - START_TIME)*100000)/100000);
            $input["input"] = array();
            if($this->api()){
                $input["api"] = $this->api()->getName();
                $input["data"] = array(
                    "source" => INPUT_DATA,
                    "params"    => $this->api()->param(),
                    "arguments" => $this->api()->argument(),
                    "filters"   => $this->api()->filter()
                );
            }
            $response["debug"] = $input;
        }

        $this->response($response, $this->transfer()->getCode());
        exit("");
    }

    protected function _fire_method ($call, $arguments) {
        $method = strtoupper($_SERVER["REQUEST_METHOD"]);
        $controllerName = get_class($call[0]);
        $methodName = $call[1];
        if (!$this->_checkHandlerAccess($method, $controllerName, $methodName)) {
            $this->transfer()->error(403);
        }
        if (!$this->transfer()->hasError()) {
            $fieldErrors = $this->api()->checkInputFieldErrors($this->_args, $arguments, $_GET);
            if ($fieldErrors) {
                $this->transfer()->error(400);
                foreach ($fieldErrors as $error) {
                    $this->transfer()->error()->field($error);
                }
            }
        }
        // parent::_fire_method
        if (!$this->transfer()->hasError()) {
            $result = call_user_func_array($call, $arguments);
            if (!is_null($result)) {
                $this->transfer($result);
            }
        }
        $this->_send();
    }

    protected function _checkHandlerAccess($method, $controllerName, $actionName){
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

    /*---------------------------------------------- VALIDATION RULES ----------------------------*/

    function _rule__required($value, $fieldName){
        return isset($value) && strlen((string) $value);
    }

    function _rule__need($value, $fieldName, $existFiled){
        return $this->_rule__required($this->input($existFiled), $existFiled);
    }

    function _rule__matches ($value, $fieldName, $matchFieldName) {
        return (bool) ($value === $this->input($matchFieldName, null));
    }

    function _rule__min_length ($value, $fieldName, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')) {
            return !(mb_strlen($value) < $length);
        }
        return !(strlen($value) < $length);
    }

    function _rule__max_length ($value, $fieldName, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return !(mb_strlen($value) > $length);
        }
        return !(strlen($value) > $length);
    }

    function _rule__exact_length ($value, $fieldName, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return (bool) (mb_strlen($value) == $length);
        }
        return (bool) (strlen($value) == $length);
    }

    function _rule__valid_email ($value, $fieldName) {
        return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
    }

    function _rule__alpha ($value) {
        return (bool) preg_match("/^([a-z])+$/i", $value);
    }

    function _rule__alpha_numeric ($value, $fieldName) {
        return (bool) preg_match("/^([a-z0-9])+$/i", $value);
    }

    function _rule__alpha_dash ($value, $fieldName) {
        return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
    }

    function _rule__numeric ($value, $fieldName) {
        return (bool) preg_match('/^[\-+]?\d*\.?\d+$/', $value);
    }

    function _rule__integer ($value, $fieldName) {
        return (bool) preg_match('/^[\-+]?\d+$/', $value);
    }

    function _rule__decimal ($value, $fieldName) {
        return (bool) preg_match('/^\d+$/', $value);
    }

    function _rule__is_natural ($value, $fieldName) {
        return (bool) preg_match( '/^[0-9]+$/', $value);
    }

    function _rule__is_natural_no_zero ($value, $fieldName) {
        return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
    }

    function _rule__valid_base64 ($value, $fieldName) {
        return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
    }

    function _rule__valid_url ($value, $fieldName) {
        return filter_var($value, FILTER_VALIDATE_URL);
    }

    function _rule__valid_date ($value, $fieldName) {
        $stamp = strtotime($value);
        if (is_numeric($stamp)) {
            return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
        }
        return false;
    }

}