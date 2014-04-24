<?php

if (!defined('DB_DEBUG')) {
    define('DB_DEBUG', false);
}

// for CI check in all file in header
if (!defined('BASEPATH')) {
    define('BASEPATH', __DIR__.DS.'active_record'.DS);
}

if (!function_exists('log_message')) {
    function log_message ($level = 'error', $message, $php_error = FALSE) {
        DB_DEBUG && trigger_error($message, E_USER_WARNING);
    }
}

if (!function_exists('show_error')) {
    function show_error ($message, $status_code = 500, $heading = 'An Error Was Encountered') {
        DB_DEBUG && trigger_error($message, E_USER_WARNING);
    }
}

class CI_ActiveRecord {

    private static $_db = array();

    /**
     * @param string $dbName
     *
     * @return CI_DB_mysql_driver
     */
    function &connect ($params){

//        "hostname" : "localhost",
//        "username" : "root",
//        "password" : "",
//        "database" : "DB_NAME",
//        "dbdriver" : "mysqli",
//        "dbprefix" : "",
//        "pconnect" : true,
//        "db_debug" : true,
//        "cache_on" : false,
//        "cachedir" : "",
//        "char_set" : "utf8",
//        "dbcollat" : "utf8_general_ci",
//        "swap_pre" : "",
//        "autoinit" : true,
//        "stricton" : false

        if (empty(self::$_db[$params['database']])) {

            require_once(BASEPATH.'DB_driver.php');

            if (!class_exists('CI_DB')){
                eval('class CI_DB extends CI_DB_driver { }');
            }

            require_once(BASEPATH.'database/drivers/'.$params['dbdriver'].'/'.$params['dbdriver'].'_driver.php');

            $driver = 'CI_DB_'.$params['dbdriver'].'_driver';

            $DB = new $driver($params);
            if ($DB->autoinit == TRUE){
                $DB->initialize();
            }
            self::$_db[$params['database']] = $DB;
        }

        return self::$_db[$params['database']];
    }

}