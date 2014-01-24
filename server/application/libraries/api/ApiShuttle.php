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
     * @var ApiUtils
     */
    public $utils;

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
        $this->utils   = new ApiUtils($this);

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

}