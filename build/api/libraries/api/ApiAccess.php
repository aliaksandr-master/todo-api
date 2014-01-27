<?php


class ApiAccess {

    const ONLY_OWNER = 'only_owner';
    const NEED_LOGIN = 'need_login';
    const ACTION     = 'action';
    const UNDEFINED  = 'api_undefined';

    /**
     * @var ApiShuttle
     */
    private $_shuttle;

    private $_accesses = array();

    private $_errors = array();

    function __construct(ApiShuttle &$shuttle){
        $this->_shuttle = $shuttle;
        $this->_accesses = $this->_shuttle->api->get(Api::ACCESS);
    }

    function checkApi($data){
        if(empty($data)){
            $this->error(405, ApiAccess::UNDEFINED);
            $this->_shuttle->output->send();
        }
    }

    function checkNeedLogin(){
        if(!empty($this->_accesses[self::NEED_LOGIN]) && !$this->_shuttle->context->user->isLogged()){
            $this->error(401, ApiAccess::NEED_LOGIN);
            $this->_shuttle->output->send();
        }
    }

    function checkContextToCall ($actionName) {
        $method = strtoupper($_SERVER["REQUEST_METHOD"]);
        $controllerName = get_class($this->_shuttle->context);
        $hasAccess = $this->_shuttle->context->hasAccess($method, $controllerName, $actionName);
        if(!$hasAccess){
            $this->error(403, self::ACTION);
            $this->_shuttle->output->send();
        }
        return $hasAccess;
    }

    function error($statusCode, $name, $params = array()){
        $this->_errors[$name] = $params;
        $this->_shuttle->output->status($statusCode);
        return $this->_errors;
    }

    function errors () {
        return $this->_errors;
    }

    function onlyOwner(){
        return !empty($this->_accesses[self::ONLY_OWNER]);
    }
}