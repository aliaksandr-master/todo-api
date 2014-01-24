<?php

class ApiOutput {


    /**
     * @var ApiShuttle
     */
    private $_shuttle;

    private $_data = array();
    private $_meta = array();

    const DEFAULT_STATUS = 200;

    private $_status = null;

    function __construct(ApiShuttle &$shuttle){
        $this->_shuttle = $shuttle;
    }

    function statusChanged(){
        return !is_null($this->_status);
    }

    public function send ($status = null) {
        $this->status($status);

        $method  = strtoupper($_SERVER["REQUEST_METHOD"]);

        $response = $this->response();
        $hasData = !empty($response['data']);

        if (!$this->_shuttle->api->hasError()) {
            if ($method == "POST") {
                if ($hasData) {
                    $this->status(201); // created new resource
                } else {
                    if(!$this->_shuttle->api->hasError()){
                        $this->status(400); // empty GET result
                    }
                }
            }else if($method == "PUT"){
                if($hasData){
                    $this->status(200); // updated resource
                }else{
                    if(!$this->_shuttle->api->hasError()){
                        $this->status(400); // empty GET result
                    }
                }
            }else if($method == "GET"){
                // ONLY 200 or SOMETHING CUSTOM
            }else if($method == "DELETE"){
                // ONLY 200 or SOMETHING CUSTOM
                if(!$this->_shuttle->api->hasError()){
                    if(!$hasData){
                        $this->status(500); // you must send Boolean response
                    }
                }
            }
        }
        // SEND RESPONSE
        if($this->_shuttle->api->hasError()){
            $response["data"] = array();
        }else{
            if(isset($response["data"])){
                $data = $this->prepareResponseData($response["data"]);
                if(is_null($data)){
                    $response["data"] = array();
                    $this->status(404);
                } else {
                    $response["data"] = $data;
                }
            } else {
                $this->status(500);
            }
        }
        // DEBUG DATA (only for development or testing mode
        if(ENVIRONMENT == "development" || ENVIRONMENT == "testing"){
            $response["debug"] = array(
                'url' => $_SERVER['REQUEST_URI'],
                'method' => $method,
                'time' => (round((gettimeofday(true) - START_TIME)*100000)/100000),
                'input' => array(
                    "api" => $this->_shuttle->api->get(Api::API_NAME),
                    'data' => array(
                        "source" => INPUT_DATA,
                        "params"    => $this->_shuttle->input->param(),
                        "arguments" => $this->_shuttle->input->argument(),
                        "filters"   => $this->_shuttle->input->filter()
                    )
                )
            );
        }
        $this->_shuttle->context->response($response, $this->status());
        // EXIT
    }

    function error($code){
        $this->status($code);
        return $this;
    }

    function status($code = null){
        if(!is_null($code)){
            if(!is_numeric($code)){
                trigger_error('Status code must be numeric type!', E_USER_ERROR);
            }
            $this->_status = $code;
        }
        return empty($this->_status) ? self::DEFAULT_STATUS : $this->_status;
    }

    function data($name = null, $value = null){
        if(!is_null($name)){
            if(is_object($name)){
                $name = (array) $name;
            }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
                $arr = array();
                $arr[$name] = $value;
                $name = $arr;
            }
            if(is_array($name)){
                foreach($name as $n => $v){
                    $this->_data[$n] = $v;
                }
            } else {
                trigger_error("invalid meta format", E_USER_WARNING);
            }
        }
        return $this->_data;
    }

    public function response(){
        $response = array(
            'status' => $this->status(),
            'data' => $this->_data
        );

        $inputErrors = $this->_shuttle->input->errors();
        if (!empty($inputErrors)) {
            $response['errors']['input'] = $inputErrors;
        }

        $accessErrors = $this->_shuttle->access->errors();
        if (!empty($accessErrors)) {
            $response['errors']['access'] = $accessErrors;
        }

        $systemErrors = $this->_shuttle->errors();
        if (!empty($systemErrors)) {
            $response['errors']['system'] = $systemErrors;
        }

        return $response;
    }

    public function clearData(){
        $this->_data = array();
        return $this;
    }

    function meta($name = null, $value = null){
        if(!is_null($name)){
            if(is_object($name)){
                $name = (array) $name;
            }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
                $arr = array();
                $arr[$name] = $value;
                $name = $arr;
            }
            if(is_array($name)){
                foreach($name as $n => $v){
                    $this->_meta[$n] = $v;
                }
            } else {
                trigger_error("invalid meta format", E_USER_WARNING);
            }
        }
        return $this->_meta;
    }

    private function _prepareData (&$_data, $data, $param, $strict = true) {
        $name = $param["name"];
        if (isset($data[$name])) {
            $_data[$name] = $this->_shuttle->utils->toType($data[$name], $param["type"]);
        } else if ($strict) {
            trigger_error("Api '".$this->_shuttle->api->get(Api::API_NAME)."': invalid response. '".$name."' is undefined!");
        }
    }

    function prepareResponseData ($data) {
        $_data = array();
        $type = $this->_shuttle->api->get(Api::RESPONSE_TYPE);

        if($type == Api::RESPONSE_TYPE_ONE){
            if (isset($data[0]) && is_array($data[0])) {
                $data = $data[0];
            }
            if (empty($data)) {
                return null;
            } else {
                foreach ($this->_shuttle->api->get(Api::RESPONSE) as $param) {
                    $this->_prepareData($_data, $data, $param, true);
                }
            }
        } else if ($type == Api::RESPONSE_TYPE_ALL) {
            if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
                $data = array($data);
            }
            foreach ($data as $k=>$_d) {
                $_data[$k] = array();
                foreach ($this->_shuttle->api->get(Api::RESPONSE) as $param) {
                    $this->_prepareData($_data[$k], $_d, $param, true);
                }
            }
        }

        return $_data;
    }

}