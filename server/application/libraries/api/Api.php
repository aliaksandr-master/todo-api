<?php

class Api {

    const REQUEST_URI_ROOT = '/server';

    const CACHE_ROOT        = CACHE_DIR;
    const CACHE_PATH        = "/api/api.txt";
    const SESSION_CACHE     = false;

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
    private $_context = null;
    private $_contextValidation = array();

    private $_input = array();
    private $_inputParams = array();
    private $_inputFilters = array();
    private $_inputArguments = array();

    function __construct (array $apiData) {
        $this->_apiData = $apiData;
        $this->_errorPref = 'Api '.$apiData[self::API_NAME].': ';
    }

    function context (API_Controller &$contextController) {
        $this->_context = $contextController;
        $this->_contextValidation = $this->_context->validationMap();
    }

    private function _initInputValue (&$errors, &$arr, $data, $param, $dataName = "name", $checkValidation = true) {
        $error = array();
        $hasError = false;
        $value = null;

        if (isset($param["validation"]) && $checkValidation) {

            $optional = true;

            $rules = array();
            foreach ($param["validation"] as $rule) {
                if ($rule["name"] == "optional") {
                    $optional = true;
                } else if ($rule['name'] == "required") {
                    $optional = false;
                } else {
                    $rules[] = $rule;
                }
            }

            if ($optional) {
                $value = isset($data[$param[$dataName]]) ? $data[$dataName] : null;
            } else {
                if (isset($data[$param[$dataName]])) {
                    $value = $data[$param[$dataName]];
                } else {
                    $error[] = array(
                        "name" => $param["name"],
                        "message" => "required"
                    );
                }
            }

            if ((!$optional || !is_null($value)) && !$error) {
                foreach ($rules as $rule) {
                    $context = $this;
                    if (isset($this->_contextValidation[$rule["name"]])) {
                        $rule["method"] = $this->_contextValidation[$rule["name"]];
                        $context = $this->_context;
                    }
                    if (method_exists($context, $rule["method"])) {
                        $call = array($context, $rule["method"]);
                        $args = array_merge(array($value), $rule["params"]);
                        if(!call_user_func_array($call, $args)){
                            $error[] = array(
                                "name" => $param["name"],
                                "message" => $rule["name"]
                            );
                        }
                    } else {
                        trigger_error($this->_errorPref.'invalid validation-rule-method "'.$rule['method'].'"', E_USER_WARNING);
                        $hasError = true;
                    }
                }
            }
        } else {
            $value = isset($data[$dataName]) ? $data[$dataName] : $value;
        }
        if ($error) {
            $errors = array_merge($errors, $error);
        } else if (!$hasError && !is_null($value)) {
            $arr[$param["name"]] = $this->_toType($value, $param["type"]);
        }
    }

    function getName () {
        return $this->_apiData[self::API_NAME];
    }

    function checkInputFieldErrors ($arguments, $urlParams, $inputFilters) {
        $errors = array();
        foreach ($this->_apiData[self::URL_PARAMS] as $param) {
            $this->_initInputValue($errors, $this->_inputParams, $urlParams, $param, $param["index"]);
        }
        foreach ($this->_apiData[self::REQUEST] as $param) {
            $this->_initInputValue($errors, $this->_inputArguments, $arguments, $param);
        }
        foreach ($this->_apiData[self::FILTERS] as $param) {
            $this->_initInputValue($errors, $this->_inputFilters, $inputFilters, $param);
        }

        $this->_input = array_merge($this->_input, $this->_inputFilters, $this->_inputParams, $this->_inputArguments);

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

    function get (array $names, array $nameMap = array()) {
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
                $data[$s] = isset($values[$s]) ? $values[$s] : null;
            } else {
                $data[$f] = isset($values[$f]) ? $values[$f] : $s;
            }
        }
        return $data;
    }

    /*---------------------------------------------- VALIDATION RULES ----------------------------*/

    final function rule_matches ($value, $fieldName) {
        $some = md5("1000".rand(0,1000)).md5(microtime()).md5(self::CACHE_PATH).rand(0, 1000);
        return (bool) ($value === $this->input($fieldName, $some));
    }

    final function rule_min_length ($value, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')) {
            return !(mb_strlen($value) < $length);
        }
        return !(strlen($value) < $length);
    }

    final function rule_max_length ($value, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return !(mb_strlen($value) > $length);
        }
        return !(strlen($value) > $length);
    }

    final function rule_exact_length ($value, $length) {
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return (bool) (mb_strlen($value) == $length);
        }
        return (bool) (strlen($value) == $length);
    }

    final function rule_valid_email ($value) {
        return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
    }

    final function rule_alpha ($value) {
        return (bool) preg_match("/^([a-z])+$/i", $value);
    }

    final function rule_alpha_numeric ($value) {
        return (bool) preg_match("/^([a-z0-9])+$/i", $value);
    }

    final function rule_alpha_dash ($value) {
        return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
    }

    final function rule_numeric ($value) {
        return (bool) preg_match( '/^[\-+]?[0-9]*\.?[0-9]+$/', $value);
    }

    final function rule_integer ($value) {
        return (bool) preg_match('/^[\-+]?[0-9]+$/', $value);
    }

    final function rule_decimal ($value) {
        return (bool) preg_match('/^[\-+]?[0-9]+\.[0-9]+$/', $value);
    }

    final function rule_is_natural ($value) {
        return (bool) preg_match( '/^[0-9]+$/', $value);
    }

    final function rule_is_natural_no_zero ($value) {
        return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
    }

    final function rule_valid_base64 ($value) {
        return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
    }

    function rule_valid_url ($value) {
        return filter_var($value, FILTER_VALIDATE_URL);
    }

    final function rule_valid_date ($value) {
        $stamp = strtotime($value);
        if (is_numeric($stamp)) {
            return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
        }
        return false;
    }

    // CELL NAME
    static function makeCellName ($method, $url1, $argsCount) {
        $url = preg_replace('#\$[^\/]+#', '%1', $url1);
        return $method." ".$url." (".$argsCount.")";
    }

    /**
     * @param string $method
     * @param array $arguments
     * @param null $uriCall
     *
     * @return Api|null
     */
    static function instanceBy ($method, $uriCall, $arguments) {

        $parsedFile = SERVER_DIR."/api/parsed.api.json";

        if (empty(self::$_apiParsed)) {
            $sessionName = self::CACHE_ROOT.self::CACHE_PATH;
            if (self::SESSION_CACHE) {
                if (empty(self::$_sessionVersion)){
                    self::$_sessionVersion = filemtime($parsedFile);
                }
                if (isset($_SESSION[$sessionName]) && $_SESSION[$sessionName]['version'] > self::$_sessionVersion) {
                    self::$_apiParsed = $_SESSION[$sessionName]['parsed'];
                }
            }
            self::$_apiParsed = json_decode(file_get_contents($parsedFile), true);
            if (self::SESSION_CACHE) {
                unset($_SESSION[$sessionName]);
                $_SESSION[$sessionName]['version'] = self::$_sessionVersion;
                self::$_apiParsed = $_SESSION[$sessionName]['parsed'];
            }
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
        $uriR = preg_replace('#(^|/)('.implode('|', $arguments).')(/|$)#', '$1$arg$3', $uriR);

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