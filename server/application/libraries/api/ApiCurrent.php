<?php

class ApiCurrent {

    private $_apiData = array();
    private $_errorPref = '';

    function __construct(array $apiData){
        $this->_apiData = $apiData;
        $this->_errorPref = 'Api '.$apiData[Api::API_NAME].': ';
    }

    private $_input = array();
    private $_inputArguments = array();
    private $_inputParams = array();
    private $_inputFilters = array();

    private function _initInputValue(&$errors, &$arr, $data, $param, $dataName = "name", $checkValidation = true){
        $error = array();
        $hasError = false;

        $value = null;

        if(isset($param["validation"]) && $checkValidation){

            $optional = true;

            $rules = array();
            foreach($param["validation"] as $key => $rule){
                if($rule["name"] == "optional"){
                    $optional = true;
                }else if($rule['name'] == "required"){
                    $optional = false;
                }else{
                    $rules[] = $rule;
                }
            }

            if($optional){
                $value = isset($data[$param[$dataName]]) ? $data[$dataName] : $value;
            }else{
                if(isset($data[$dataName])){
                    $value = $data[$dataName];
                }else{
                    $error[] = array($param["name"], "required");
                }
            }

            if((!$optional || !is_null($value)) && !$error){
                foreach($rules as $rule){
                    if(method_exists($this, $rule["method"])){
                        $call = array($this, $rule["method"]);
                        $args = array_merge(array($value), $rule["params"]);
                        if(!call_user_func_array($call, $args)){
                            $error[] = array($param["name"], $rule["name"]);
                        }
                    }else{
                        trigger_error($this->_errorPref.'invalid validation-rule-method "'.$rule['method'].'"', E_USER_WARNING);
                        $hasError = true;
                    }
                }
            }
        } else {
            $value = isset($data[$dataName]) ? $data[$dataName] : $value;
        }
        if($error){
            $errors[] = $error;
        }else if(!$hasError && !is_null($value)){
            $arr[$param["name"]] = $this->_toType($value, $param["type"]);
        }
    }

    function getName(){
        return $this->_apiData[Api::API_NAME];
    }

    function checkInputFieldErrors($arguments, $urlParams, $inputFilters){
        $errors = array();
        foreach($this->_apiData[Api::URL_PARAMS] as $param){
            $this->_initInputValue($errors, $this->_inputParams, $urlParams, $param, $param["index"]);
        }
        foreach($this->_apiData[Api::REQUEST] as $param){
            $this->_initInputValue($errors, $this->_inputArguments, $arguments, $param);
        }
        foreach($this->_apiData[Api::FILTERS] as $param){
            $this->_initInputValue($errors, $this->_inputFilters, $inputFilters, $param);
        }

        $this->_input = array_merge($this->_input, $this->_inputFilters, $this->_inputParams, $this->_inputArguments);

        return $errors;
    }

    private function _toType($var, $type){
        switch($type){
            case Api::TYPE_NUMBER:
            case Api::TYPE_INTEGER:
                return intval(trim((string) $var));
            case Api::TYPE_FLOAT:
                return floatval(trim((string) $var));
            case Api::TYPE_BOOL:
            case Api::TYPE_BOOLEAN:
                return (bool) $var;
        }
        return trim((string) $var); // default type = string
    }

    private function _prepareData(&$_data, $data, $param, $strict = true){
        $name = $param["name"];
        if(isset($data[$name])){
            $_data[$name] = $this->_toType($data[$name], $param["type"]);
        } else if ($strict) {
            trigger_error("Api '".$this->_apiData[Api::API_NAME]."': invalid response. '".$name."' is undefined!");
        }
    }

    function prepareResponseData($data){
        $_data = array();
        $type = $this->_apiData[Api::RESPONSE_TYPE];

        if($type == Api::RESPONSE_TYPE_ONE){
            if (isset($data[0]) && is_array($data[0])) {
                $data = $data[0];
            }
            if (empty($data)) {
                return null;
            } else {
                foreach($this->_apiData[Api::RESPONSE] as $param){
                    $this->_prepareData($_data, $data, $param, true);
                }
            }
        } else if ($type == Api::RESPONSE_TYPE_ALL) {
            if(!empty($data) && (!isset($data[0]) || !is_array($data[0]))){
                $data = array($data);
            }
            foreach($data as $k=>$_d){
                $_data[$k] = array();
                foreach($this->_apiData[Api::RESPONSE] as $param){
                    $this->_prepareData($_data[$k], $_d, $param, true);
                }
            }
        }

        return $_data;
    }

    function argument ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_inputArguments;
        }
        if (isset($this->_inputArguments[$name])) {
            return $this->_inputArguments[$name];
        }
        return $default;
    }

    function param ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_inputParams;
        }
        if (isset($this->_inputParams[$name])) {
            return $this->_inputParams[$name];
        }
        return $default;
    }

    function filter ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_inputFilters;
        }
        if (isset($this->_inputFilters[$name])) {
            return $this->_inputFilters[$name];
        }
        return $default;
    }

    function input($name = null, $default = null){
        if (is_null($name)) {
            return $this->_input;
        }
        if (isset($this->_input[$name])) {
            return $this->_input[$name];
        }
        return $default;
    }

    /*---------------------------------------------- VALIDATION RULES ----------------------------*/

    final function rule_matches($value, $fieldName){
        $some = md5("1000".rand(0,1000)).md5(microtime()).md5(Api::CACHE_PATH).rand(0, 1000);
        return (bool) ($value === $this->input($fieldName, $some));
    }

    final function rule_min_length($value, $length){
        if(preg_match("/[^0-9]/", $length)){
            return false;
        }
        if(function_exists('mb_strlen')){
            return !(mb_strlen($value) < $length);
        }
        return !(strlen($value) < $length);
    }

    final function rule_max_length($value, $length){
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return !(mb_strlen($value) > $length);
        }
        return !(strlen($value) > $length);
    }

    final function rule_exact_length($value, $length){
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return (bool) (mb_strlen($value) == $length);
        }
        return (bool) (strlen($value) == $length);
    }

    final function rule_valid_email($value){
        return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
    }

    final function rule_alpha($value){
        return (bool) preg_match("/^([a-z])+$/i", $value);
    }

    final function rule_alpha_numeric($value){
        return (bool) preg_match("/^([a-z0-9])+$/i", $value);
    }

    final function rule_alpha_dash($value){
        return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
    }

    final function rule_numeric($value){
        return (bool) preg_match( '/^[\-+]?[0-9]*\.?[0-9]+$/', $value);
    }

    final function rule_integer($value){
        return (bool) preg_match('/^[\-+]?[0-9]+$/', $value);
    }

    final function rule_decimal($value){
        return (bool) preg_match('/^[\-+]?[0-9]+\.[0-9]+$/', $value);
    }

    final function rule_is_natural($value){
        return (bool) preg_match( '/^[0-9]+$/', $value);
    }

    final function rule_is_natural_no_zero($value){
        return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
    }

    final function rule_valid_base64($value){
        return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
    }

    function rule_valid_url($value){
        return filter_var($value, FILTER_VALIDATE_URL);
    }

    final function rule_valid_date($value){
        $stamp = strtotime( $value );
        if (is_numeric($stamp)){
            return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
        }
        return false;
    }

}