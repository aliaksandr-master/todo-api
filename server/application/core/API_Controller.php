<?php

require_once(APPPATH.'/libraries/REST_Controller.php');

abstract class API_Controller extends REST_Controller {

    public function inputArguments(){
        return $this->_args;
    }

    protected $_inputData = array();

    protected function _fire_method($call, $arguments){
        $METHOD = strtoupper($_SERVER["REQUEST_METHOD"]);
        $controllerName = get_class($call[0]);
        $methodName = $call[1];
        $callPath = strtolower($controllerName)."/".preg_replace('/_'.$METHOD.'$/i', '', strtolower($methodName));

        $apiJson = $this->_parseApiJsonFormat();

        $apiName = $this->_getApiNameByCurrentRequest($apiJson, $arguments);

        if($apiName){
            $this->_apiCheckInputParams($apiJson[$apiName], $arguments);
        }else{
            $this->transfer()->code(405);
        }

        if (!$this->_apiCheckHandlerAccess($METHOD, $callPath)) {
            if(!$this->transfer()->hasError()){
                $this->transfer()->code(403);
            }
        }else if(!$this->transfer()->hasError()){
            parent::_fire_method($call, $arguments);
        }

        $this->_apiSendSmartyStatusCodes();

        // SEND RESPONSE
        $this->response($this->transfer()->getAllData(), $this->transfer()->getCode());
        exit("");
    }

    protected function checkInputData($args = null){
        if(is_null($args)){
            $args = $this->inputArguments();
        }
    }

    private function _parseApiJsonFormat(){
        $JSON_FILE_PATH = SERVER_DIR."/api/api.json";
        if(isset($_SESSION["api/parsedJsonApi"])){
            if(isset($_SESSION["api/parsedJsonApi/version"]) && $_SESSION["api/parsedJsonApi/version"] >= filemtime($JSON_FILE_PATH)){
                return $_SESSION["api/parsedJsonApi"];
            }
        }
        $_SESSION["api/parsedJsonApi/version"] = filemtime($JSON_FILE_PATH);
        $apiJson = json_decode(file_get_contents($JSON_FILE_PATH), true);

        $api = array();
        foreach($apiJson as $apiName => $apiData){
            $requestParams = array();
            $responseParams = array();
            $responseType = "item";
            foreach ($apiData as $directive => $options) {
                preg_match_all('/^(request|response)\:?(.*)$/', $directive, $m);
                if (!empty($m[1][0])) {
                    if ($m[1][0] == "request") {
                        $requestParams = $options;
                    } else {
                        $responseParams = $options;
                        if (!empty($m[2][0])) {
                            if (preg_match('/^(array|item)$/', $m[2][0])) {
                                $responseType = $m[2][0];
                            } else {
                                trigger_error("Api: invalid format of response type in '".$apiName."'");
                                die("");
                            }
                        }
                    }
                }
            }

            foreach($responseParams as $optionName => $option){
                $opt = preg_split('/\s*:\s*/', $option);
                $opt[1] = isset($opt[1]) ? $opt[1] : "string";
                if(!preg_match('/^(string|number|boolean|float|integer)$/',$opt[1])){
                    trigger_error('Api: "'.$apiName.'" Invalid type of param ["'.$option.'"]', E_USER_WARNING);
                    die("");
                }
                $responseParams[$optionName] = array(
                    "name" => $opt[0],
                    "type" => $opt[1]
                );
            }

            $urlParams = array();
            foreach($requestParams as $optionName => $option){
                $opt = preg_split('/\s*\:\s*/', $optionName);
                $opt[1] = isset($opt[1]) ? $opt[1] : "string";
                if(!preg_match('/^(string|number|boolean|float|integer)$/',$opt[1])){
                    trigger_error('Api: "'.$apiName.'" Invalid type of param ["'.$optionName.'"]', E_USER_WARNING);
                    die("");
                }
                if(is_string($option)){
                    $option = preg_split('/\|/', $option);
                }
                if(preg_match('/\$/', $opt[0])){
                    $opt[0] = preg_replace('/\$/', '', $opt[0]);
                    $urlParams[] = array(
                        'name' => $opt[0],
                        'type' => $opt[1],
                        'validation' => $option
                    );
                    unset($requestParams[$optionName]);
                } else {
                    $requestParams[$optionName][] = array(
                        "name" => $opt[0],
                        "type" => $opt[1],
                        'validation' => $option
                    );
                }
            }

            $_urlParams = array();
            foreach($urlParams as $_param){
                $index = strpos($apiName, "$".$_param["name"]);
                $_urlParams[$index] = $_param;
            }
            $urlParams = array();
            foreach($_urlParams as $_param){
                $_param["index"] = count($urlParams);
                $urlParams[] = $_param;
            }

            $api[$apiName] = array(
                "name" => $apiName,
                "url" => $urlParams,
                "request" => $requestParams,
                "response_type" => $responseType,
                "response" => $responseParams
            );
        }
        $_SESSION["api/parsedJsonApi"] = $api;
        return $api;
    }

    protected function _getApiNameByCurrentRequest($apiJson, $arguments){
        $METHOD = strtoupper($_SERVER["REQUEST_METHOD"]);

        $apiName = null;

        $compatibleApiNames = array();
        foreach($apiJson as $_apiName => $_handlerName){
            preg_match_all('/\$(?:[^\/]+)/', $_apiName, $m);
            if(preg_match('/^(?:'.$METHOD.'|ANY)/', $_apiName)){
                if(count($arguments)){
                    if(!empty($m[0]) && count($m[0]) == count($arguments)){
                        $compatibleApiNames[] = $_apiName;
                    }
                } else {
                    $compatibleApiNames[] = $_apiName;
                }
            }
        }
        $uri = $_SERVER["REQUEST_URI"];
        $uri = str_replace('/server/', '', $uri); // TODO: remove valid base URI
        $uri = preg_replace('/\/+$/', '', $uri);
        $uri = str_replace('\\', '/', $uri);
        $maskUri = $METHOD.' '.$uri;
        $maskUriAny = 'ANY '.$uri;
        foreach($compatibleApiNames as $_name){
            $maskExp = $_name;
            $maskExp = str_replace('\\', '/', $maskExp);
            $maskExp = preg_replace('/(?:\$[^\/\\\]+)/', '[^\/]+', $maskExp);
            $maskExp = '@^'.$maskExp.'$@';
            if(preg_match($maskExp, $maskUri)){
                $apiName = $_name;
                break;
            }else if(preg_match($maskExp, $maskUriAny)){
                $apiName = $_name;
                break;
            }
        }
        return $apiName;
    }

    protected function _apiSendSmartyStatusCodes(){
        $METHOD  = strtoupper($_SERVER["REQUEST_METHOD"]);
        // SMART STATUS CODES
        if (!$this->transfer()->hasError()) {
            if ($METHOD == "POST") {
                if ($this->transfer()->data()->getResult()) {
                    $this->transfer()->code(201); // created new resource
                } else {
                    if(!$this->transfer()->hasError()){
                        $this->transfer()->code(400); // empty GET result
                    }
                }
            }else if($METHOD == "PUT"){
                if($this->transfer()->data()->getResult()){
                    $this->transfer()->code(200); // updated resource
                }else{
                    if(!$this->transfer()->hasError()){
                        $this->transfer()->code(400); // empty GET result
                    }
                }
            }else if($METHOD == "GET"){
                // ONLY 200 or SOMETHING CUSTOM
            }else if($METHOD == "DELETE"){
                // ONLY 200 or SOMETHING CUSTOM
                if(!$this->transfer()->hasError()){
                    if(!$this->transfer()->data()->getResult()){
                        $this->transfer()->code(500); // you must send Boolean response
                    }
                }
            }
        }
    }

    protected function _apiCheckHandlerAccess($METHOD, $callPath){
        $callName = $METHOD." ".$callPath;
        $callNameAny = "ANY ".$callPath;

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

    private function _apiPrepareInputParams($inputParams, $apiJsonByCurrentApiName, $arguments){
        $args = array();

        if(isset($apiJsonByCurrentApiName["url"])){
            foreach($apiJsonByCurrentApiName["url"] as $urlParam){
                $args[$urlParam["name"]] = $this->_toType($arguments[$urlParam["index"]], $urlParam["type"]);
            }
        }

        foreach($apiJsonByCurrentApiName["request"] as $param){
            $name = $param["name"];
            $args[$name] = $this->_apiGetFieldValueByValidation($inputParams, $name, $param);
        }

        return $args;
    }

    private function _apiGetFieldValueByValidation($params, $name, $param){
        $rules = isset($param["validation"]) ? $param["validation"] : array();
        $value = null;
        if(!isset($params[$name])){
            if(in_array("required", $rules) || in_array(true, $rules)){
                $this->transfer()->error()->field($name, "required");
            }
        }else{
            $value = $params[$name];
        }
        return $this->_toType($value, $param["type"]);
    }

    private function _toType($var, $type){
        switch($type){
            case "number":
            case "integer":
                return intval(trim((string) $var));
            case "float":
                return floatval(trim((string) $var));
            case "boolean":
                return (bool) $var;
        }

        return trim((string) $var); // default type = string
    }

    protected function _input($name, $default = null){
        if(is_null($this->_args[$name])){
            return $default;
        }
        if(!isset($this->_args[$name])){
            trigger_error("Ivalid _input offset '".$name."'", E_USER_WARNING);
            die();
        }
        return $this->_args[$name];
    }

    private function _apiCheckInputParams($apiJsonByCurrentApiName, $arguments){
        $this->_args = $this->_apiPrepareInputParams($this->_args, $apiJsonByCurrentApiName, $arguments);
        return !$this->transfer()->hasError();
    }

}