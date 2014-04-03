<?php


class ApiInput extends ApiComponentAbstract {

    private $_input = array();

    private $_URL = array();
    private $_QUERY = array();
    private $_BODY = array();

    private $_URL_SOURCE = array();
    private $_QUERY_SOURCE = array();
    private $_BODY_SOURCE = array();

    private $_additionalQueryParams = array(
        array(
            'name' => '_virtual',
            'type' => 'boolean'
        ),
        array(
            'name' => 'limit',
            'type' => 'decimal'
        ),
        array(
            'name' => 'offset',
            'type' => 'decimal'
        )
    );

    private $_additionalBodyParams = array();

    function init (){
        $requestInput = ApiUtils::get($this->api->api->get(Api::REQUEST), 'input', array());

        // QUERY
        $param = $this->_initParam($this->api->server->query, ApiUtils::get($requestInput, 'QUERY', array()), $this->_additionalQueryParams, false);
        $this->_QUERY = $param['data'];
        $this->_QUERY_SOURCE = $param['source'];

        // BODY
        $param = $this->_initParam($this->api->server->body, ApiUtils::get($requestInput, 'BODY', array()), $this->_additionalBodyParams, false);
        $this->_BODY = $param['data'];
        $this->_BODY_SOURCE = $param['source'];

        // URL
        $param = $this->_initParam($this->api->server->url, ApiUtils::get($requestInput, 'URL', array()), array(), true);
        $this->_URL = $param['data'];
        $this->_URL_SOURCE = $param['source'];

        $this->_input = array_merge($this->_input, $this->_QUERY, $this->_URL, $this->_BODY);
    }

    function prepare () {
        $requestInput = ApiUtils::get($this->api->api->get(Api::REQUEST), 'input', array());
        $this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'QUERY', array()), $this->_QUERY);
        $this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'BODY', array()), $this->_BODY);
        $this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'URL', array()), $this->_URL);
    }

    function body ($name = null, $default = null) {
        if (is_null($name)) return $this->_BODY;
        return ApiUtils::get($this->_BODY, $name, $default);
    }

    function url ($name = null, $default = null) {
        if (is_null($name)) return $this->_URL;
        return ApiUtils::get($this->_URL, $name, $default);
    }

    function query ($name = null, $default = null) {
        if (is_null($name)) return $this->_QUERY;
        return ApiUtils::get($this->_QUERY, $name, $default);
    }

    function get ($name = null, $default = null) {
        if (is_null($name)) return $this->_input;
        return ApiUtils::get($this->_input, $name, $default);
    }

    function _initParam ($pData, $apiData, $additional = array(), $byIndex = false) {
        $data = array();
        $source = array();

        $_apiData = array();
        $_apiData = array_merge($_apiData, $apiData, $additional);
        if ($_apiData) {
            foreach ($_apiData as $index => $param) {

                $fieldName = $param["name"];
                $by = $byIndex ? $index : $fieldName;

                $value = ApiUtils::get($pData, $by, null);

                if (!is_null($value)) {
                    $source[$fieldName] = $value;
                    if (!empty($param['filters']['before'])) {
                        $value = $this->api->filter->applyFilters($value, $param['filters']['before'], $fieldName);
                    }
                    $data[$fieldName] = $this->api->format->toType($value, $param["type"], $param);
                }
            }
        }
        return array(
            'data' => $data,
            'source' => $source
        );
    }

    function _applyAfterFiltersToParam ($requestInputData, &$data) {
        foreach ($requestInputData as $param) {
            $fieldName = $param['name'];
            $value = ApiUtils::get($data, $fieldName, null);
            if (!is_null($value)) {
                if (!empty($param['filters']['after'])) {
                    $value = $this->api->filter->applyFilters($value, $param['filters']['after'], $fieldName);
                }
                $data[$fieldName] = $value;
            }
        }
    }

    private function _checkParam ($requestInputData, $data) {
        $valid = 1;
        foreach ($requestInputData as $param) {
            $value = ApiUtils::get($data, $param['name'], null);
            if (!empty($param['validation'])) {
                $valid *= $this->api->validation->validate($param["name"], $value, $param['validation'], true);
            }
        }
        return $valid;
    }

    function check () {
        $valid = 1;
        $requestInput = ApiUtils::get($this->api->api->get(Api::REQUEST), 'input', array());
        $valid *= $this->_checkParam(ApiUtils::get($requestInput, 'URL', array()), $this->_URL);
        $valid *= $this->_checkParam(ApiUtils::get($requestInput, 'BODY', array()), $this->_BODY);
        $valid *= $this->_checkParam(ApiUtils::get($requestInput, 'QUERY', array()), $this->_QUERY);
        if (!$valid) {
            $this->api->output->send();
        }
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

    function __get($name){
        return $this->get($name);
    }

}