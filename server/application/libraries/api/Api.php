<?php

define('API_FILE', SERVER_DIR."/api/api.json");
require_once('ApiCurrent.php');

class Api {

    const REQUEST_URI_ROOT = '/server';

    const CACHE_ROOT        = CACHE_DIR;
    const CACHE_PATH        = "/api/api.txt";
    const CACHE_TYPE        = ''; // file, session, null

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

    private static $_apiSource  = array();
    private static $_apiParsed  = array();
    private static $_apiInit    = false;
    private static $_version    = null;

    private static $_currentSingletonApi = array();

    function __construct(){
        if(self::CACHE_TYPE){
            if(self::CACHE_TYPE == 'file'){
                $this->_loadFromFileCache();
                $this->cleanSession();
            }else if(self::CACHE_TYPE == 'session'){
                $this->_loadFromSessionCache();
            }
        }else{
            $this->cleanSession();
            $this->_initApiFile();
        }
    }

    private function _loadFromFileCache(){
        // TODO: create global-loading form file
    }

    private function cleanSession(){
        $sessionName = self::CACHE_ROOT.self::CACHE_PATH;
        unset($_SESSION[$sessionName]);
    }

    private function _loadFromSessionCache(){
        $sessionName = self::CACHE_ROOT.self::CACHE_PATH;

        if(empty(self::$_version)){
            self::$_version = filemtime(API_FILE);
        }

        if(empty($_SESSION[$sessionName]) || $_SESSION[$sessionName]['version'] < self::$_version){
            $this->_initApiFile();
            $_SESSION[$sessionName]['source'] = self::$_apiSource;
            $_SESSION[$sessionName]['parsed'] = self::$_apiSource;
            $_SESSION[$sessionName]['version'] = self::$_version;
        }else{
            self::$_apiSource = $_SESSION[$sessionName]['source'];
            self::$_apiParsed = $_SESSION[$sessionName]['parsed'];
            self::$_apiInit = true;
        }
    }

    private function _parseOptionWithType ($option) {
        $opt = preg_split('/\s*:\s*/', $option);
        $opt[1] = isset($opt[1]) ? $opt[1] : self::TYPE_STRING;
        if (preg_match('/^('.self::TYPES.')$/',$opt[1])) {
            return array (
                "name" => $opt[0],
                "type" => $opt[1]
            );
        }
        return null;
    }

    /**
     * @param string $method
     * @param array $arguments
     * @param null $uriCall
     *
     * @return ApiCurrent|null
     */
    public function getCurrentApi ($method, $uriCall, $arguments) {
        $method = strtoupper($method);
        if (is_null($uriCall)) {
            $uriCall = $_SERVER["REQUEST_URI"];
        }
        $uriCall = str_replace(self::REQUEST_URI_ROOT.'/', '', $uriCall); // TODO: remove valid base URI
        $uriCall = preg_replace('/\?(.+)$/', '', $uriCall);
        $uriCall = str_replace('\\', '/', $uriCall);
        $uriCall = preg_replace('#(/+)$#', '', $uriCall);

        $uriR = $uriCall;
        $uriR = preg_replace('#(^|/)('.implode('|', $arguments).')(/|$)#', '$1$arg$3', $uriR);

        $cellName = $this->makeCellName($method, $uriR, count($arguments));

        if(!empty(self::$_currentSingletonApi[$cellName])){
            return self::$_currentSingletonApi[$cellName];
        }
        self::$_currentSingletonApi[$cellName] = null;

        $apiName = null;

        $maskUri = $method.' '.$uriCall;

        foreach (self::$_apiParsed as $_apiName => $_apiData) {
            if ($cellName == $_apiData[self::CELL_NAME]) {
                $maskExp = $_apiName;
                $maskExp = str_replace('\\', '/', $maskExp);
                $maskExp = preg_replace('/(?:\$[^\/\\\]+)/', '[^\/]+', $maskExp);
                $maskExp = '#^'.$maskExp.'$#';
                if(preg_match($maskExp, $maskUri)){
                    $apiName = $_apiName;
                    break;
                }
            }
        }


        if ($apiName) {
            self::$_currentSingletonApi[$cellName] = new ApiCurrent(self::$_apiParsed[$apiName]);
        }

        return self::$_currentSingletonApi[$cellName];
    }

    private function _initApiFile(){
        if(self::$_apiInit){
            return;
        }
        self::$_apiInit = true;

        self::$_apiSource = json_decode(file_get_contents(API_FILE), true);

        $api = array();
        foreach (self::$_apiSource as $apiName => $apiData) {
            $errorPref = 'Api ["'.$apiName.'"]: ';
            $_urlParams = array();
            $requestParams = array();
            $responseParams = array();
            $filterParams = array();
            $responseType = self::RESPONSE_TYPE_ONE;

            foreach ($apiData as $directive => $options) {
                preg_match_all('/^('.self::REQUEST.'|'.self::RESPONSE.'|'.self::FILTERS.')\:?(.*)$/', $directive, $m);
                if (!empty($m[1][0])) {

                    // PARSE REQUEST and URL
                    if ($m[1][0] == self::REQUEST) {
                        foreach ($options as $optionName => $option) {

                            $opt = $this->_parseOptionWithType($optionName);

                            if (is_null($opt)) {
                                trigger_error($errorPref.'"Invalid type of param "'.$optionName.'", available: '.self::TYPES, E_USER_WARNING);
                            } else {

                                $opt['validation'] = $this->_parseValidation($option);

                                if(preg_match('/^\$/', $opt['name'])){
                                    $opt['param'] = $opt['name'];
                                    $opt['name']  = preg_replace('/^\$/', '', $opt['param']);
                                    $index = strpos($apiName, "$".$opt["name"]);
                                    $_urlParams[$index] = $opt;
                                } else {
                                    $requestParams[] = $opt;
                                }
                                $_requestParams[] = $opt;
                            }
                        }

                    // PARSE RESPONSE
                    } else if ($m[1][0] == self::RESPONSE) {
                        if (empty($m[2][0])) {
                            $responseType = self::RESPONSE_TYPE_ONE;
                        } else if (preg_match('/^('.self::RESPONSE_TYPES.')$/', $m[2][0])) {
                            $responseType = $m[2][0];
                        } else {
                            trigger_error($errorPref."invalid format of response type in '".$apiName."'");
                            continue;
                        }
                        foreach($options as $optionName => $option){
                            $opt = $this->_parseOptionWithType($option);
                            if (is_null($opt)) {
                                trigger_error($errorPref.'"Invalid type of param "'.$option.'", available: '.self::TYPES, E_USER_WARNING);
                            } else {
                                $responseParams[$optionName] = $opt;
                            }
                        }
                    } else if ($m[1][0] == self::FILTERS){
                        // FILTERS
                        foreach($options as $optionName => $option){
                            $opt = $this->_parseOptionWithType($option);
                            if (is_null($opt)) {
                                trigger_error($errorPref.'"Invalid type of param "'.$option.'", available: '.self::TYPES, E_USER_WARNING);
                            } else {
                                $filterParams[$optionName] = $opt;
                            }
                        }

                    }
                }
            }


            // VALID URL PARAMS SEQUENCE
            ksort($_urlParams, SORT_NUMERIC);
            $urlParams = array();
            foreach($_urlParams as $opt){
                $opt["index"] = count($urlParams);
                $urlParams[] = $opt;
            }

            // METHOD
            $method = preg_replace('/^([A-Z]+)\s+(.+)$/', "$1", $apiName);

            // REQUEST_URI
            $url = preg_replace('/^([A-Z]+)\s+(.+)$/', "$2", $apiName);


            // RESULT
            $api[$apiName] = array(
                self::URL => $url,
                self::ARGUMENTS_COUNT => count($urlParams),
                self::REQUEST_METHOD => $method,
                self::API_NAME => $apiName,
                self::URL_PARAMS => $urlParams,
                self::FILTERS => $filterParams,
                self::REQUEST => $requestParams,
                self::RESPONSE_TYPE => $responseType,
                self::RESPONSE => $responseParams,
                self::CELL_NAME => $this->makeCellName($method, $url, count($urlParams))
            );
        }
        self::$_apiParsed = $api;
    }

    function makeCellName($method, $url1, $argsCount){
        $url = preg_replace('#\$[^\/]+#', '%1', $url1);
        return $method." ".$url." (".$argsCount.")";
    }

    function _parseValidation($option){
        if (is_string($option)) {
            $option = preg_split('/(\s*\|\s*)+/', $option);
        }
        $opt = array();
        foreach($option as $rule){
            $ruleName   = preg_replace("/^([a-z0-9_]+)(.*)$/i", "$1", $rule);
            $_paramsJson = preg_replace("/^([a-z0-9_]+)(.*)$/i", "$2", $rule);
            $params = $_paramsJson ? json_decode($_paramsJson, true) : array();
            $opt[$ruleName] = array(
                'source' => $rule,
                "name" => trim($ruleName),
                "method" => "rule_".trim($ruleName),
                "params" => $params
            );
        }
        return $opt;
    }


}