<?php

class Api {

    private $_config = array(
        'send_only_virtual_status_codes' => false,
        'send_only_2xx_3xx_403_404_500_503' => false
    );

    const REQUEST_URI_ROOT  = API_ROOT_PATH; // '/server'

    const API_NAME          = 'api_name';
    const CELL_NAME         = 'id';
    const URL               = 'url';
    const URL_PARAMS        = 'params';
    const ARGUMENTS_COUNT   = 'params_count';
    const FILTERS           = 'filters';
    const RESPONSE          = 'response';
    const RESPONSE_TYPE     = "response_type";
    const REQUEST           = 'request';
    const REQUEST_METHOD    = "method";
    const ACCESS            = "access";

    const RESPONSE_TYPES    = 'item|array';
    const RESPONSE_TYPE_ONE = 'item';
    const RESPONSE_TYPE_ALL = 'array';

    const TYPES             = 'array|object|number|string|integer|float|boolean|bool';
    const TYPE_ARRAY        = 'array';
    const TYPE_OBJECT       = 'object';
    const TYPE_NUMBER       = 'number';
    const TYPE_STRING       = 'string';
    const TYPE_INTEGER      = 'integer';
    const TYPE_FLOAT        = 'float';
    const TYPE_BOOLEAN      = 'boolean';
    const TYPE_BOOL         = 'bool';

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
     * @var ApiShuttle
     */
    private $_shuttle;

    function __construct (array $apiData, ApiController &$context) {
        $this->_apiData = $apiData;
        $this->_shuttle = new ApiShuttle($this, $context);

        $this->input = $this->_shuttle->input;
        $this->output = $this->_shuttle->output;
    }

    function check($actionName, $args, $urlParams, $filters){

        $this->_shuttle->access->checkApi($this->_apiData);
        $this->_shuttle->access->checkNeedLogin();
        $this->_shuttle->access->checkContextToCall($actionName);

        $this->_shuttle->input->init($args, $urlParams, $filters);

        $this->_shuttle->input->check();
    }

    function get ($name, $default = null) {
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

        $parsedFile = GENERATED_DIR."/api.parsed.json";

        if (empty(self::$_apiParsed)) {
            self::$_apiParsed = json_decode(file_get_contents($parsedFile), true);
        }

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
        $uriR = preg_replace('#/('.$implArgs.')/#', '/$arg/', $uriR);
        $uriR = preg_replace('#^('.$implArgs.')/#', '$arg/', $uriR);
        $uriR = preg_replace('#^('.$implArgs.')$#', '$arg', $uriR);
        $uriR = preg_replace('#/('.$implArgs.')$#', '/$arg', $uriR);

        // CELL NAME
        $cellName = $method." ".preg_replace('#\$[^\/]+#', '%1', $uriR)." (".count($arguments).")";

        if (!empty(self::$_singletons[$cellName])) {
            return self::$_singletons[$cellName];
        }

        $apiData = array();

        $maskUri = $method.' '.$uriCall;

        if (isset(self::$_apiParsed[$cellName])) {
            $_apiName = self::$_apiParsed[$cellName][self::API_NAME];
            $maskExp = $_apiName;
            $maskExp = str_replace('\\', '/', $maskExp);
            $maskExp = preg_replace('/(?:\$[^\/\\\]+)/', '[^\/]+', $maskExp);
            $maskExp = '#^'.$maskExp.'$#';
            if (preg_match($maskExp, $maskUri)) {
               $apiData = self::$_apiParsed[$cellName];
            }
        }

        self::$_singletons[$cellName] = new Api($apiData, $context);

        return self::$_singletons[$cellName];
    }

}