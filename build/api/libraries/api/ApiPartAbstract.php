<?php

abstract class ApiPartAbstract extends ApiAbstract {

    /** @var array */
    protected $_initParams;

    /** @var bool */
    protected $_initDefaults = true;

    final public function __construct (Api &$api, array $params = array (), $initDefault = true) {
        $this->api = $api;
        $this->_initParams = $params;
        $this->_initDefaults = $initDefault;

        $this->construct();
    }

    public function construct () {

    }

    public function init () {

    }

    function prepare () {

    }

}