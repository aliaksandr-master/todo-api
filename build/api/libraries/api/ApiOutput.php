<?php

class ApiOutput extends ApiPartAbstract {

    const COMPRESSING = true;

    const DEFAULT_STATUS = 200;
    const RESPONSE_TYPE_ONE = 'one';
    const RESPONSE_TYPE_ALL = 'many';

    protected $_data = array();
    protected $_meta = array();

    protected $_status = null;

    public function send ($status = null) {
        $this->status($status);

        $method  = strtoupper($_SERVER["REQUEST_METHOD"]);

        $response = array(
            'status' => $this->status(),
            'data' => $this->_data
        );

        if ($this->_meta) {
            $response['meta'] = $this->_meta;
        }

        $errors = $this->api->getErrors();
        if ($errors) {
            $response['errors'] = $errors;
        }

        $hasData = !empty($response['data']);

        if ($this->api->valid()) {
            if ($method == "POST") {
                if ($hasData) {
                    $this->status(201); // created new resource
                } else {
                    if($this->api->valid()){
                        $this->status(404); // empty GET result
                    }
                }
            }else if($method == "PUT"){
                if($hasData){
                    $this->status(200); // updated resource
                }else{
                    if($this->api->valid()){
                        $this->status(500); // empty GET result
                    }
                }
            }else if($method == "GET"){
                // ONLY 200 or SOMETHING CUSTOM
            }else if($method == "DELETE"){
                // ONLY 200 or SOMETHING CUSTOM
                if(!$hasData){
                    if($this->api->valid()){
                        $this->status(500); // you must send Boolean response
                    }
                }
            }
        }

        // SEND RESPONSE
        if (!$this->api->valid()) {
            $response["data"] = array();
        } else {
            if (isset($response["data"])) {
                $data = $this->prepareResponseData($response["data"], 'data');
                if (is_null($data)) {
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
        if ($this->api->debugMode()) {
            $response["debug"] = array(
                'url' => $_SERVER['REQUEST_URI'],
                'method' => $method,
                'time' => (round((gettimeofday(true) - START_TIME) * 100000) / 100000),
                'input' => array(
                    'headers' => array(
                        'accept' => $this->api->server->accept,
                        'encoding' => $this->api->server->encoding,
                        'language' => $this->api->server->language,
                        'inputFormat' => $this->api->server->inputFormat,
                        'outputFormat' => $this->api->server->outputFormat,
                        'outputMime' => $this->api->server->outputMime,
                    ),
                    'server' => array (
                        'ip' => $this->api->server->ip,
                        'host' => $this->api->server->host,
                        'hostname' => $this->api->server->hostname,
                        'port' => $this->api->server->port,
                        'path' => $this->api->server->path,
                        'pathname' => $this->api->server->pathname,
                        'search' => $this->api->server->search,
                        'scheme' => $this->api->server->scheme,
                        'protocol' => $this->api->server->protocol,
                    ),
                    "url"    => $this->api->input->url(),
                    "query"  => $this->api->input->query(),
                    "body"   => $this->api->input->body(),
                    "body:source" => INPUT_DATA
                ),
                "api" => $this->api->get()
            );
        }

        $http_code = $this->status();
        $response = (string) $this->api->format->applyFormat($response, $this->api->server->outputFormat);

        header('HTTP/1.1: ' . $http_code);
        header('Status: ' . $http_code);
        header('Content-Length: ' . strlen($response));
        header('Content-Type: '.$this->api->server->outputMime);

        $zlibOc = @ini_get('zlib.output_compression');
        $compressing = self::COMPRESSING && !$zlibOc && extension_loaded('zlib') && ApiUtils::get($this->api->server->encoding, 'gzip', false);

        if (!$zlibOc && !$compressing) {
            header('Content-Length: ' . strlen($response));
        } else if ($compressing) {
            ob_start('ob_gzhandler');
        }

        $this->api->context->response($response);
    }

    function status($code = null){
        if(!is_null($code)){
            if(!is_numeric($code)){
                trigger_error('Status code "'.$code.'" must be numeric type!', E_USER_ERROR);
            }
            $this->_status = $code;
        }
        return empty($this->_status) ? ApiOutput::DEFAULT_STATUS : $this->_status;
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

        if($type == ApiOutput::RESPONSE_TYPE_ONE){
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
        } else if ($type == ApiOutput::RESPONSE_TYPE_ALL) {
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