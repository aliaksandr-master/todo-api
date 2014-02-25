<?php


class ApiInput extends ApiPartAbstract {

    private $_input = array();
    private $format = null;
    private $_URL = array();
    private $_QUERY = array();
    private $_BODY = array();

    function ruleError ($inputParamName, $ruleName, array $ruleParams = array(), $statusCode = 400) {
        $this->_errors[$inputParamName][$ruleName] = $ruleParams;
        $this->api->output->status($statusCode);
        return $this;
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

    function body ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_BODY;
        }
        if (isset($this->_BODY[$name])) {
            return $this->_BODY[$name];
        }
        return $default;
    }

    function url ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_URL;
        }
        if (isset($this->_URL[$name])) {
            return $this->_URL[$name];
        }
        return $default;
    }

    function query ($name = null, $default = null) {
        if (is_null($name)) {
            return $this->_QUERY;
        }
        if (isset($this->_QUERY[$name])) {
            return $this->_QUERY[$name];
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

    function _initBody () {
        $input = $this->api->server->body;
        $request = $this->api->api->get(Api::REQUEST);
        if (!empty($request['input']['BODY'])) {
            foreach ($request['input']['BODY'] as $param) {
                $value = isset($input[$param['name']]) ? $input[$param['name']] : null;
                if (!is_null($value)) {
                    foreach ($param['filters']['before'] as $filter) {
                        $value = $this->api->filter->applyFilter($value, key($filter), $filter[key($filter)], $param['name']);
                    }
                    $this->_BODY[$param["name"]] = $this->api->format->toType($value, $param["type"], $param);
                }
            }
        }
    }

    function _initQuery () {
        $QUERY = $this->api->server->query;
        $request = $this->api->api->get(Api::REQUEST);
        if (!empty($request['input']['QUERY'])) {
            foreach ($request['input']['QUERY'] as $param) {
                $value = isset($QUERY[$param['name']]) ? $QUERY[$param['name']] : null;
                if (!is_null($value)) {
                    foreach ($param['filters']['before'] as $filter) {
                        $value = $this->api->filter->applyFilter($value, key($filter), $filter[key($filter)], $param['name']);
                    }
                    $this->_QUERY[$param["name"]] = $this->api->format->toType($value, $param["type"], $param);
                }
            }
        }
    }

    function _initUrl () {
        $url = $this->api->server->url;
        $request = $this->api->api->get(Api::REQUEST);
        if (!empty($request['input']['URL'])) {
            foreach ($request['input']['URL'] as  $index => $param) {
                $value = isset($url[$index]) ? $url[$index] : null;
                if (!is_null($value)) {
                    foreach ($param['filters']['before'] as $filter) {
                        $value = $this->api->filter->applyFilter($value, key($filter), $filter[key($filter)], $param["name"]);
                    }
                    $this->_URL[$param["name"]] = $this->api->format->toType($value, $param["type"], $param);
                }
            }
        }
    }

    function init (){
        $this->_initBody();
        $this->_initQuery();
        $this->_initUrl();
        $this->_input = array_merge($this->_input, $this->_QUERY, $this->_URL, $this->_BODY);
    }

    function check () {
        $valid = 1;
        $request = $this->api->api->get(Api::REQUEST);
        if (!empty($request['input']['URL'])) {
            foreach ($request['input']['URL'] as $param) {
                $value = isset($this->_URL[$param['name']]) ? $this->_URL[$param['name']] : null;
                if (!empty($param['validation'])) {
                    $valid *= $this->validate($param["name"], $value, $param['validation'], true);
                }
            }
        }
        if (!empty($request['input']['BODY'])) {
            foreach ($request['input']['BODY'] as $param) {
                $value = isset($this->_BODY[$param['name']]) ? $this->_BODY[$param['name']] : null;
                if (!empty($param['validation'])) {
                    $valid *= $this->validate($param["name"], $value, $param['validation'], true);
                }
            }
        }
        if (!empty($request['input']['QUERY'])) {
            foreach ($request['input']['QUERY'] as $param) {
                $value = isset($this->_QUERY[$param['name']]) ? $this->_QUERY[$param['name']] : null;
                if (!empty($param['validation'])) {
                    $valid *= $this->validate($param["name"], $value, $param['validation'], true);
                }
            }
        }
        if (!$valid) {
            $this->api->output->send();
        }
    }

    function applyAfterFilters () {
        $request = $this->api->api->get(Api::REQUEST);
        if (!empty($request['input']['QUERY'])) {
            foreach ($request['input']['QUERY'] as $param) {
                $value = isset($QUERY[$param['name']]) ? $QUERY[$param['name']] : null;
                if (!is_null($value)) {
                    foreach ($param['filters']['before'] as $filter) {
                        $value = $this->api->applyFilter($value, key($filter), $filter[key($filter)], $param['name']);
                    }
                    $this->_QUERY[$param["name"]] = $this->api->toType($value, $param["type"], $param);
                }
            }
        }
    }


    function validate ($fieldName, $value, array $validation, $setError = false) {
        $error = false;

        $rules = $validation['rules'];
        $required = !empty($validation["required"]);

        if($required && !$this->api->validation->applyRule($value, 'required')){
            if ($setError) {
                $this->ruleError($fieldName, 'required', array(), 400);
            }
            $error = true;
        }

        if (!$error && isset($value) && (strlen((string)$value) || $value === false)) {
            foreach ($rules as $rule) {
                $ruleName = key($rule);
                $ruleParams = $rule[$ruleName];
                if (!$this->api->validation->applyRule($value, $ruleName, $ruleParams, $fieldName)) {
                    if ($setError) {
                        $this->ruleError($fieldName, $ruleName, $ruleParams, 400);
                    }
                    $error = true;
                    break;
                }
            }
        }
        return !$error;
    }

    function pick () {
        $copy = array();

        $keys = func_get_args();
        foreach ($keys as $key) {
            if (!is_array($key)){
                $key = array($key);
            }
            foreach ($key as $k) {
                if (isset($this->_input[$k])) {
                    $copy[$k] = $this->_input[$k];
                }
            }
        }

        return $copy;
    }

    function omit () {
        $copy = array();
        foreach ($this->_input as $k => $v) {
            $copy[$k] = $v;
        }
        $keys = func_get_args();
        foreach ($keys as $key) {
            if (!is_array($key)){
                $key = array($key);
            }
            foreach ($key as $k) {
                unset($copy[$k]);
            }
        }
        return $copy;
    }

    function __get($name){
        return $this->get($name);
    }

}