<?php

require_once(SERVER_DIR."/".APPPATH.'/libraries/REST_Controller.php');
require_once(SERVER_DIR."/".APPPATH.'/libraries/api/Api.php');
require_once(SERVER_DIR."/".APPPATH.'/libraries/data_transfer/DataTransfer.php');

abstract class API_Controller extends REST_Controller {

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

    public function validationMap(){
        return array();
    }

    protected $_inputData = array();

    public function api($names = null,  $namesMap = array()){
        if (!is_null($names)) {
            return $this->_api->get($names, $namesMap);
        }
        return $this->_api;
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
                    $this->transfer()->error()->field($error["name"], $error["message"]);
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

}