<?php

abstract class ApiComponent extends ApiAbstract {

    /** @var array */
    protected $_initParams;

    /** @var bool */
    protected $_initDefaults = true;

    public function __construct (Api &$api) {
        $this->api = $api;
    }

    public function init () {}

    function prepareCallAction () {}

}