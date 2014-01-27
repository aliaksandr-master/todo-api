<?php


class ApiInput {


    /**
     * @var ApiShuttle
     */
    private $_shuttle;

    private $_input = array();
    private $_inputParams = array();
    private $_inputFilters = array();
    private $_inputArguments = array();

    private $_errors = array();

    function __construct (ApiShuttle &$shuttle) {
        $this->_shuttle = $shuttle;
    }

    function error ($inputParamName, $ruleName, $ruleParams = array(), $statusCode = null) {
        $this->_errors[$inputParamName][$ruleName] = $ruleParams;
        $this->_shuttle->output->status($statusCode);
        return $this;
    }

    function errors () {
        return $this->_errors;
    }

    function pipe (array $names, array $nameMap = array(), $withoutEmpty = true) {
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

    function get ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_input;
        }
        if (isset($this->_input[$name])) {
            return $this->_input[$name];
        }
        return $default;
    }

    function init ($arguments, $urlParams, $inputFilters){
        foreach ($this->_shuttle->api->get(Api::URL_PARAMS) as $param) {
            $value = isset($urlParams[$param['index']]) ? $urlParams[$param['index']] : null;
            if (!is_null($value)) {
                $this->_inputParams[$param["name"]] = $this->_shuttle->toType($value, $param["type"]);
            }
        }
        foreach ($this->_shuttle->api->get(Api::REQUEST) as $param) {
            $value = isset($arguments[$param['name']]) ? $arguments[$param['name']] : null;
            if (!is_null($value)) {
                $this->_inputArguments[$param["name"]] = $this->_shuttle->toType($value, $param["type"]);
            }
        }
        foreach ($this->_shuttle->api->get(Api::FILTERS) as $param) {
            $value = isset($inputFilters[$param['name']]) ? $inputFilters[$param['name']] : null;
            if (!is_null($value)) {
                $this->_inputFilters[$param["name"]] = $this->_shuttle->toType($value, $param["type"]);
            }
        }
        $this->_input = array_merge($this->_input, $this->_inputFilters, $this->_inputParams, $this->_inputArguments);
    }

    function check () {
        $valid = 1;
        foreach ($this->_shuttle->api->get(Api::URL_PARAMS) as $param) {
            $value = isset($this->_inputParams[$param['name']]) ? $this->_inputParams[$param['name']] : null;
            if (!empty($param['validation'])) {
                $valid *= $this->validate($param["name"], $value, $param['validation'], true);
            }
        }
        foreach ($this->_shuttle->api->get(Api::REQUEST) as $param) {
            $value = isset($this->_inputArguments[$param['name']]) ? $this->_inputArguments[$param['name']] : null;
            if (!empty($param['validation'])) {
                $valid *= $this->validate($param["name"], $value, $param['validation'], true);
            }
        }
        foreach ($this->_shuttle->api->get(Api::FILTERS) as $param) {
            $value = isset($this->_inputFilters[$param['name']]) ? $this->_inputFilters[$param['name']] : null;
            if (!empty($param['validation'])) {
                $valid *= $this->validate($param["name"], $value, $param['validation'], true);
            }
        }
        if (!$valid) {
            $this->_shuttle->output->send();
        }
    }


    function validate($fieldName, $value, array $rules, $setError = false){
        $fuckUp = false;
        $error  = false;

        $required = !empty($rules["required"]) || empty($rules["optional"]);
        if($required && !$this->_shuttle->context->_rule__required($value, $fieldName)){
            if ($setError) {
                $this->error($fieldName, 'required', array(), 400);
            }
            $error = true;
        }

        unset($rules["optional"]);
        unset($rules["required"]);

        if (!$error && $this->_shuttle->context->_rule__required($value, $fieldName)) {
            foreach ($rules as $rule) {
                if (method_exists($this->_shuttle->context, $rule["method"])) {
                    $call = array($this->_shuttle->context, $rule["method"]);
                    $args = array_merge(array($value), array($fieldName), $rule["params"]);
                    if(!call_user_func_array($call, $args)){
                        if ($setError) {
                            $this->error($fieldName, $rule["name"], $rule['params'], 400);
                        }
                        $error = true;
                        break;
                    }
                } else {
                    trigger_error($this->_shuttle->errorPref.'invalid validation-rule-method "'.$rule['method'].'"', E_USER_WARNING);
                    $fuckUp = $rule['method'];
                    break;
                }
            }
        }
        if ($fuckUp) {
            $this->_shuttle->error('Validation Method "'.$fuckUp.'" Doesn\'t exists');
        }
        return !($error || $fuckUp);
    }

}