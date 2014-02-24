<?php

class ApiFilter extends ApiPartAbstract {

    function init () {}

    public function applyFilter ($value, $filterName, array $params = array(), $contextName = null) {
        $method = '_filter__'.$filterName;

        if (method_exists($this->api->context, $method)) {
            return $this->api->context->$method($value, $params, $contextName);
        }

        return $this->$method($value, $params, $contextName);
    }

    function _filter__xss ($value, $params = array(), $name) {
        return $value;
    }

    function _filter__trim ($value, $params = array(), $name) {
        return trim((string)$value);
    }

}