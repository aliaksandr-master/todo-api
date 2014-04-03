<?php

class ApiFilter extends ApiComponent {

    function init () {}

    public function applyFilter ($value, $filterName, array $params = array(), $contextName = null) {
        $method = '_filter__'.$filterName;

        if (method_exists($this->api->context, $method)) {
            return $this->api->context->$method($value, $params, $contextName);
        }

        return $this->$method($value, $params, $contextName);
    }

    function applyFilters ($value, $filters, $fieldName) {
        if (!empty($filters)) {
            foreach ($filters as $filter) {
                $filterName = key($filter);
                $filterParams = $filter[$filterName];
                $value = $this->api->filter->applyFilter($value, $filterName, $filterParams, $fieldName);
            }
        }
        return $value;
    }

    function _filter__xss ($value, $params = array(), $name) {
        return $value;
    }

    function _filter__trim ($value, $params = array(), $name) {
        return trim((string)$value);
    }

    function _filter__to_int ($value, $params = array(), $name) {
        return (int) $value;
    }

    function _filter__abs ($value, $params = array(), $name) {
        return abs($value);
    }

    function _filter__to_bool ($value, $params = array(), $name) {
        return (bool) $value;
    }

    function _filter__to_float ($value, $params = array(), $name) {
        return (float) $value;
    }

}