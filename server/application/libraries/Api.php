<?php

class Api {

    const REQUEST_URI_ROOT = '/server';

    const CACHE_ROOT        = CACHE_DIR;
    const CACHE_PATH        = "/api/api.txt";

    const API_NAME          = 'api_name';
    const CELL_NAME         = 'id';
    const URL               = 'url';
    const URL_PARAMS        = 'params';
    const ARGUMENTS_COUNT   = 'params_count';
    const FILTERS           = 'filters';
    const RESPONSE          = 'response';
    const RESPONSE_TYPE     = "response_type";
    const REQUEST           = 'request';
    const REQUEST_METHOD    = "method";
    const ACCESS            = "access";

    const RESPONSE_TYPES    = 'item|array';
    const RESPONSE_TYPE_ONE = 'item';
    const RESPONSE_TYPE_ALL = 'array';

    const TYPES             = 'array|object|number|string|integer|float|boolean|bool';
    const TYPE_ARRAY        = 'array';
    const TYPE_OBJECT       = 'object';
    const TYPE_NUMBER       = 'number';
    const TYPE_STRING       = 'string';
    const TYPE_INTEGER      = 'integer';
    const TYPE_FLOAT        = 'float';
    const TYPE_BOOLEAN      = 'boolean';
    const TYPE_BOOL         = 'bool';

    private static $_apiParsed  = array();
    private static $_sessionVersion = null;
    private static $_currentSingletonApi = array();

    private $_apiData = array();
    private $_errorPref = '';

    /**
     * @var ApiController
     */
    private $_context = null;

    private $_input = array();
    private $_inputParams = array();
    private $_inputFilters = array();
    private $_inputArguments = array();

    function __construct (array $apiData) {
        $this->_apiData = $apiData;
        $this->_errorPref = 'Api '.$apiData[self::API_NAME].': ';
    }

    function context (ApiController &$contextController) {
        $this->_context = $contextController;
    }

    private function _initInputValue (&$input, &$origInput, $param, $value) {
        if (!is_null($value)) {
            $input[$param["name"]] = $this->_toType($value, $param["type"]);
            $origInput[$param['name']] = $value;
        }
    }

    private function _validate(&$errors, $origInput, $value, $param){
        $error = array();
        if (!empty($param['validation'])) {
            $error = $this->validate($value, $param['validation'], $param["name"], $origInput);
        }
        if (!empty($error)) {
            if (is_array($error)) {
                $errors = array_merge($errors, $error);
            }
        }
    }

    function hasOnlyOwner(){
        return !empty($this->_apiData[self::ACCESS]['only_owner']);
    }

    function hasNeedLogin(){
        return !empty($this->_apiData[self::ACCESS]['need_login']);
    }

    function validate($value, $rules, $fieldName, $origInput = array()){
        $hasError = false;
        $error = array();

        $required = !empty($rules["required"]) || empty($rules["optional"]);
        if($required && !$this->_context->_rule__required($value, $fieldName)){
            $error[] = array(
                $fieldName => array(
                    "required" => array()
                )
            );
        }

        unset($rules["optional"]);
        unset($rules["required"]);

        if (!$error && $this->_context->_rule__required($value, $fieldName)) {
            foreach ($rules as $rule) {
                if (method_exists($this->_context, $rule["method"])) {
                    $call = array($this->_context, $rule["method"]);
                    $args = array_merge(array($value), array($fieldName), $rule["params"]);
                    if(!call_user_func_array($call, $args)){
                        $error[] = array(
                            $fieldName => array(
                                $rule["name"] => $rule['params']
                            )
                        );
                        break;
                    }
                } else {
                    trigger_error($this->_errorPref.'invalid validation-rule-method "'.$rule['method'].'"', E_USER_WARNING);
                    $hasError = true;
                }
            }
        }
        return $error ? $error : ($hasError ? true : false);
    }

    function getName () {
        return $this->_apiData[self::API_NAME];
    }

    function checkInputFieldErrors ($arguments, $urlParams, $inputFilters) {
        $errors = array();
        $origInput = array();
        foreach ($this->_apiData[self::URL_PARAMS] as $param) {
            $value = isset($urlParams[$param['index']]) ? $urlParams[$param['index']] : null;
            $this->_initInputValue($this->_inputParams, $origInput, $param, $value);
        }
        foreach ($this->_apiData[self::REQUEST] as $param) {
            $value = isset($arguments[$param['name']]) ? $arguments[$param['name']] : null;
            $this->_initInputValue($this->_inputArguments, $origInput, $param, $value);
        }
        foreach ($this->_apiData[self::FILTERS] as $param) {
            $value = isset($inputFilters[$param['name']]) ? $inputFilters[$param['name']] : null;
            $this->_initInputValue($this->_inputFilters, $origInput, $param, $value);
        }

        $this->_input = array_merge($this->_input, $this->_inputFilters, $this->_inputParams, $this->_inputArguments);

        foreach ($this->_apiData[self::URL_PARAMS] as $param) {
            $value = isset($urlParams[$param['index']]) ? $urlParams[$param['index']] : null;
            $this->_validate($errors, $origInput, $value, $param);
        }
        foreach ($this->_apiData[self::REQUEST] as $param) {
            $value = isset($arguments[$param['name']]) ? $arguments[$param['name']] : null;
            $this->_validate($errors, $origInput, $value, $param);
        }
        foreach ($this->_apiData[self::FILTERS] as $param) {
            $value = isset($inputFilters[$param['name']]) ? $inputFilters[$param['name']] : null;
            $this->_validate($errors, $origInput, $value, $param);
        }
        return $errors;
    }

    private function _toType ($var, $type) {
        switch ($type) {
            case self::TYPE_NUMBER:
            case self::TYPE_INTEGER:
                return intval(trim((string) $var));
            case self::TYPE_FLOAT:
                return floatval(trim((string) $var));
            case self::TYPE_BOOL:
            case self::TYPE_BOOLEAN:
                return (bool) $var;
        }
        return trim((string) $var); // default type = string
    }

    private function _prepareData (&$_data, $data, $param, $strict = true) {
        $name = $param["name"];
        if (isset($data[$name])) {
            $_data[$name] = $this->_toType($data[$name], $param["type"]);
        } else if ($strict) {
            trigger_error("Api '".$this->_apiData[self::API_NAME]."': invalid response. '".$name."' is undefined!");
        }
    }

    function prepareResponseData ($data) {
        $_data = array();
        $type = $this->_apiData[self::RESPONSE_TYPE];

        if($type == self::RESPONSE_TYPE_ONE){
            if (isset($data[0]) && is_array($data[0])) {
                $data = $data[0];
            }
            if (empty($data)) {
                return null;
            } else {
                foreach ($this->_apiData[self::RESPONSE] as $param) {
                    $this->_prepareData($_data, $data, $param, true);
                }
            }
        } else if ($type == self::RESPONSE_TYPE_ALL) {
            if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
                $data = array($data);
            }
            foreach ($data as $k=>$_d) {
                $_data[$k] = array();
                foreach ($this->_apiData[self::RESPONSE] as $param) {
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

    function input ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_input;
        }
        if (isset($this->_input[$name])) {
            return $this->_input[$name];
        }
        return $default;
    }

    function get (array $names, array $nameMap = array(), $withoutEmpty = true) {
        $values = array();
        foreach ($this->_input as $name => $val) {
            if(isset($nameMap[$name])){
                $name = $nameMap[$name];
            }
            $values[$name] = $val;
        }
        $data = array();
        foreach ($names as $f => $s) {
            if (is_numeric($f)) {
                if(isset($values[$s])){
                    $data[$s] = $values[$s];
                } else if(!$withoutEmpty){
                    $data[$s] = null;
                }
            } else {
                if(isset($values[$f])){
                    $data[$f] = $values[$f];
                } else if(isset($s) || !$withoutEmpty){
                    $data[$f] = $s;
                }
            }
        }
        return $data;
    }

    // CELL NAME
    static function makeCellName ($method, $url1, $argsCount) {
        $url = preg_replace('#\$[^\/]+#', '%1', $url1);
        return $method." ".$url." (".$argsCount.")";
    }

    /**
     * @param string $method
     * @param string $uriCall
     * @param array $arguments
     *
     * @return Api|null
     */
    static function instanceBy ($method, $uriCall, array $arguments = array()) {

        $parsedFile = GENERATED_DIR."/api.parsed.json";

        if (empty(self::$_apiParsed)) {
            self::$_apiParsed = json_decode(file_get_contents($parsedFile), true);
        }

        $method = strtoupper($method);
        if (is_null($uriCall)) {
            $uriCall = $_SERVER["REQUEST_URI"];
        }
        $uriCall = str_replace(self::REQUEST_URI_ROOT.'/', '', $uriCall); // TODO: remove valid base URI
        $uriCall = preg_replace('/\?(.+)$/', '', $uriCall);
        $uriCall = str_replace('\\', '/', $uriCall);
        $uriCall = preg_replace('#(/+)$#', '', $uriCall);

        $uriR = $uriCall;
        $implArgs = implode('|', $arguments);
        $uriR = preg_replace('#/('.$implArgs.')/#', '/$arg/', $uriR);
        $uriR = preg_replace('#^('.$implArgs.')/#', '$arg/', $uriR);
        $uriR = preg_replace('#^('.$implArgs.')$#', '$arg', $uriR);
        $uriR = preg_replace('#/('.$implArgs.')$#', '/$arg', $uriR);

        $cellName = self::makeCellName($method, $uriR, count($arguments));

        if (!empty(self::$_currentSingletonApi[$cellName])) {
            return self::$_currentSingletonApi[$cellName];
        }
        self::$_currentSingletonApi[$cellName] = null;

        $apiName = null;

        $maskUri = $method.' '.$uriCall;

        if (isset(self::$_apiParsed[$cellName])) {
            $_apiName = self::$_apiParsed[$cellName][self::API_NAME];
            $maskExp = $_apiName;
            $maskExp = str_replace('\\', '/', $maskExp);
            $maskExp = preg_replace('/(?:\$[^\/\\\]+)/', '[^\/]+', $maskExp);
            $maskExp = '#^'.$maskExp.'$#';
            if (preg_match($maskExp, $maskUri)) {
                $apiName = $_apiName;
                self::$_currentSingletonApi[$cellName] = new Api(self::$_apiParsed[$cellName]);
            }
        }

        return self::$_currentSingletonApi[$cellName];
    }

}