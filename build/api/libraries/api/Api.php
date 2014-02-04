<?php

class Api {

    private $_config = array();

    const REQUEST_URI_ROOT  = API_ROOT_URL; // '/server'

    const NAME              = 'name';
    const VERSION           = 'version';
    const URL               = 'url';
    const RESPONSE          = 'response';
    const REQUEST           = 'request';
    const ACCESS            = "access";

    const TYPE_TEXT         = 'text';
    const TYPE_DECIMAL      = 'decimal';
    const TYPE_STRING       = 'string';
    const TYPE_INTEGER      = 'integer';
    const TYPE_FLOAT        = 'float';
    const TYPE_BOOLEAN      = 'boolean';

    private static $_apiParsed  = array();
    private static $_singletons = array();

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
     * @var ApiShuttle
     */
    private $_shuttle;

    function __construct (array $apiData, ApiController &$context) {
        $this->_apiData = $apiData;
        $this->_shuttle = new ApiShuttle($this, $context);

        $this->input  = $this->_shuttle->input;
        $this->output = $this->_shuttle->output;
        $this->access = $this->_shuttle->access;
    }

    function check($actionName, $args, $urlParams, $filters){
        $this->_shuttle->access->checkApi($this->_apiData);
        $this->_shuttle->access->checkNeedLogin();
        $this->_shuttle->access->checkContextToCall($actionName);

        $this->_shuttle->input->init($args, $urlParams, $filters);

        $this->_shuttle->input->check();
    }

    function get ($name = null, $default = null) {
        if (is_null($name)){
            return $this->_apiData;
        }
        return isset($this->_apiData[$name]) ? $this->_apiData[$name] : $default;
    }

    function config ($name) {
        if(isset($this->_config[$name])){
            return $this->_config[$name];
        }
        trigger_error($this->_shuttle->errorPref.'bad config name "'.$name.'"');
        return null;
    }

    public function hasError(){
        if((bool)$this->_shuttle->input->errors()){
            return true;
        }
        if((bool)$this->_shuttle->access->errors()){
            return true;
        }
        if((bool)$this->_shuttle->errors()){
            return true;
        }
        if($this->_shuttle->output->status() >= 400){
            return true;
        }
        return false;
    }



    /**
     * @param ApiController $context
     * @param string $method
     * @param string $uriCall
     * @param array $arguments
     *
     * @return Api
     */
    static function instanceBy (ApiController &$context, $method, $uriCall, array $arguments = array()) {

        $parsedFile = VAR_DIR.DS."api.parsed.json";

        $method = strtoupper($method);
        if (is_null($uriCall)) {
            $uriCall = $_SERVER["REQUEST_URI"];
        }
        $uriCall = str_replace(self::REQUEST_URI_ROOT.'/', '', $uriCall); // TODO: remove valid base URI
        $uriCall = preg_replace('/\?(.+)$/', '', $uriCall);
        $uriCall = str_replace('\\', '/', $uriCall);
        $uriCall = preg_replace('#(/+)$#', '', $uriCall);

        $uriR = $uriCall;
        $implArgs = implode('|', $arguments);
        $uriR = preg_replace('#^('.$implArgs.')$#', '<param>', $uriR);
        $uriR = preg_replace('#^('.$implArgs.')/#', '<param>/', $uriR);
        $uriR = preg_replace('#/('.$implArgs.')/#', '/<param>/', $uriR);
        $uriR = preg_replace('#/('.$implArgs.')$#', '/<param>', $uriR);

        // CELL NAME
        $cellName = $method.":".$uriR;
        $cellName = sha1($cellName);

        if (!empty(self::$_singletons[$cellName])) {
            return self::$_singletons[$cellName];
        }

        $apiData = array();

        $apiFile = VAR_DIR.DS.'system'.DS.$cellName.'.php';
        if (is_file($apiFile)) {
            $apiData = include($apiFile);
        }

        self::$_singletons[$cellName] = new Api($apiData, $context);

        return self::$_singletons[$cellName];
    }

}