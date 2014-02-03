<?php

class ApiShuttle {
    /**
     * @var ApiController
     */
    public $context;

    /**
     * @var ApiInput
     */
    public $input;

    /**
     * @var ApiOutput
     */
    public $output;

    /**
     * @var ApiAccess
     */
    public $access;

    /**
     * @var Api
     */
    public $api;

    public $errorPref = 'Api ';

    public function __construct(Api &$api, ApiController &$context){

        $this->api     = $api;
        $this->context = $context;
        $this->input   = new ApiInput($this);
        $this->output  = new ApiOutput($this);
        $this->access  = new ApiAccess($this);

        $this->errorPref .= $this->api->get(Api::API_NAME).': ';
    }

    private $_errors = array();

    function error($message){
        $this->_errors[] = $message;
        $this->output->send(500);
    }

    function errors(){
        return $this->_errors;
    }

    public function applyFilter ($var, $filter, $params = array()) {
        $filterMethod = '_filter__'.$filter;
        return $this->context->$filterMethod($var, $params);
    }

    public function toType ($var, $type, $param = null) {
        switch ($type) {
            case Api::TYPE_DECIMAL:
            case Api::TYPE_INTEGER:
                return intval(trim((string) $var));
            case Api::TYPE_FLOAT:
                return floatval(trim((string) $var));
            case Api::TYPE_BOOLEAN:
                return (bool) $var;
        }
        return trim((string) $var); // default type = string
    }

}