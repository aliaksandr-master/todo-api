<?php

if (!defined('DB_DEBUG')) {
    define('DB_DEBUG', false);
}

// for CI check in all file in header
if (!defined('BASEPATH')) {
    define('BASEPATH', str_replace(SD, DS, __DIR__).DS);
//	build/opt/ci_active_record/database/drivers/mysqli/mysqli_driver.php
//  build/opt/ci_active_record/database/database/drivers/mysqli/mysqli_driver.php
}

// for CI check in all file in header
if (!defined('APPPATH')) {
    define('APPPATH', str_replace(SD, DS, __DIR__).DS);
//	build/opt/ci_active_record/database/drivers/mysqli/mysqli_driver.php
//  build/opt/ci_active_record/database/database/drivers/mysqli/mysqli_driver.php
}

if (!function_exists('log_message')) {
    function log_message ($level = 'error', $message, $php_error = FALSE) {
//        DB_DEBUG && trigger_error($message, E_USER_WARNING);
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
    public static function &connect ($params){

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

            require_once(BASEPATH.'database'.DS.'DB_driver.php');

			require_once(BASEPATH.'database'.DS.'DB_active_rec.php');

			if (!class_exists('CI_DB')) {
				eval('class CI_DB extends CI_DB_active_record { }');
			}

            require_once(BASEPATH.'database'.DS.'drivers'.DS.$params['dbdriver'].DS.$params['dbdriver'].'_driver.php');

            $Driver = 'CI_DB_'.$params['dbdriver'].'_driver';

            $DB = new $Driver($params);
			$DB->initialize();
            self::$_db[$params['database']] = $DB;
        }

        return self::$_db[$params['database']];
    }

}