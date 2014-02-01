<?php

class DbTableFieldAbstract {

    private $_dbName;
    private $_aliasName;

    private $_table;

    public $uid = 0;

    private static $_uid = 0;
    static function UID(){
        return self::$_uid++;
    }

    function __construct(DbTable &$table){

        $this->uid = self::UID();

        $this->_table = $table;

    }

    function &getTable(){

        return $this->_table;

    }

    function setDbName($name){
        if(!is_null($this->_dbName)){
            trigger_error("You mustn't set dbName twice! ");
            exit;
        }
        $this->_dbName = $name;
        return $this;
    }

    function setAliasName($name){
        if(!is_null($this->_aliasName)){
            trigger_error("You mustn't set aliasName twice! ");
            exit;
        }
        $this->_aliasName = $name;
        return $this;
    }

    function getDbName(){
        return $this->_dbName;
    }

    function getAliasName(){
        return $this->_aliasName;
    }



}