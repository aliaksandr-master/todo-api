<?php

class ApiOutput extends ApiPartAbstract {

    const DEFAULT_STATUS = 200;
    const RESPONSE_TYPE_ONE = 'one';
    const RESPONSE_TYPE_ALL = 'many';

    protected $_data = array();
    protected $_meta = array();

    protected $_status = null;

    function statusChanged(){
        return !is_null($this->_status);
    }

    public function send ($status = null) {
        $this->status($status);

        $method  = strtoupper($_SERVER["REQUEST_METHOD"]);

        $response = $this->response();
        $hasData = !empty($response['data']);

        if ($this->api->valid()) {
            if ($method == "POST") {
                if ($hasData) {
                    $this->status(201); // created new resource
                } else {
                    if($this->api->valid()){
                        $this->status(500); // empty GET result
                    }
                }
            }else if($method == "PUT"){
                if($hasData){
                    $this->status(200); // updated resource
                }else{
                    if($this->api->valid()){
                        $this->status(400); // empty GET result
                    }
                }
            }else if($method == "GET"){
                // ONLY 200 or SOMETHING CUSTOM
            }else if($method == "DELETE"){
                // ONLY 200 or SOMETHING CUSTOM
                if($this->api->valid()){
                    if(!$hasData){
                        $this->status(500); // you must send Boolean response
                    }
                }
            }
        }

        // SEND RESPONSE
        if(!$this->api->valid()){
            $response["data"] = array();
        }else{
            if(isset($response["data"])){
                $data = $this->prepareResponseData($response["data"], 'data');
                if(is_null($data)){
                    $response["data"] = array();
                } else {
                    $response["data"] = $data;
                }
            } else {
                $response["data"] = array();
            }
        }

        // SEND RESPONSE
        if (isset($response["meta"])) {
            $response["meta"] = $this->prepareResponseData($response["meta"], 'meta');
        }

        // DEBUG DATA (only for development and testing mode)
        if(ENVIRONMENT == "development" || ENVIRONMENT == "testing"){
            $response["debug"] = array(
                'url' => $_SERVER['REQUEST_URI'],
                'method' => $method,
                'time' => (round((gettimeofday(true) - START_TIME) * 100000) / 100000),
                'input' => array(
                    "URL"    => $this->api->input->url(),
                    "QUERY"  => $this->api->input->query(),
                    "BODY"   => $this->api->input->body(),
                    "BODY:source" => INPUT_DATA
                ),
                "API" => $this->api->get()
            );
        }
        $this->_sendResponse($response, $this->status());
    }

    public function _sendResponse($data = null, $http_code = null) {

        $http_code = is_numeric($http_code) ? $http_code : 200;
        $data = (string) $this->api->format->applyFormat($data, $this->api->server->outputFormat);

        header('HTTP/1.1: ' . $http_code);
        header('Status: ' . $http_code);
        header('Content-Length: ' . strlen($data));
        header('Content-Type: '.$this->api->server->outputMime);

        $this->api->context->response($data);
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
            'data' => $this->_data,
            'meta' => $this->_meta
        );

        $response['errors'] = $this->api->getErrors();

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
            $_data[$name] = $this->api->format->toType($data[$name], $param["type"]);
        } else if ($strict) {
            trigger_error("Api '".$this->api->get(Api::NAME)."': invalid response. '".$name."' is undefined!");
        }
    }

    function prepareResponseData ($data, $keyName = 'data') {
        $_data = array();
        $response = $this->api->get(Api::RESPONSE);
        $type = $response['type'];

        if($type == self::RESPONSE_TYPE_ONE){
            if (isset($data[0]) && is_array($data[0])) {
                $data = $data[0];
            }
            if (empty($data)) {
                return null;
            } else {
                if (!empty($response['output'][$keyName])) {
                    foreach ($response['output'][$keyName] as $param) {
                        $this->_prepareData($_data, $data, $param, true);
                    }
                }
            }
        } else if ($type == self::RESPONSE_TYPE_ALL) {
            if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
                $data = array($data);
            }
            if (!empty($response['output'][$keyName])) {
                foreach ($data as $k => $_d) {
                    $_data[$k] = array();
                    foreach ($response['output'][$keyName] as $param) {
                        $this->_prepareData($_data[$k], $_d, $param, true);
                    }
                }
            }
        }

        return $_data;
    }

}