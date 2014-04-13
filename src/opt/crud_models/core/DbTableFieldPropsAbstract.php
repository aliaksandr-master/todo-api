<?php

abstract class DbTableFieldPropsAbstract extends DbTableFieldAbstract{

    const aTYPE_BOOL     = "BOOL";
    const dTYPE_BOOL     = "TINYINT";
    const aTYPE_TINYINT  = "TINYINT";
    const dTYPE_TINYINT  = "TINYINT";
    const aTYPE_INT      = "INT";
    const dTYPE_INT      = "INT";
    const aTYPE_DOUBLE   = "DOUBLE";
    const dTYPE_DOUBLE   = "DOUBLE";
    const aTYPE_VARCHAR  = "VARCHAR";
    const dTYPE_VARCHAR  = "VARCHAR";
    const aTYPE_TEXT     = "TEXT";
    const dTYPE_TEXT     = "TEXT";
    const aTYPE_DATE     = "DATE";
    const dTYPE_DATE     = "DATE";
    const aTYPE_DATETIME = "DATETIME";
    const dTYPE_DATETIME = "DATETIME";

    private $_dbLength;
    private $_dbDefault;
    private $_dbUnsigned;
    private $_dbUnique;
    private $_dbPrimary;
    private $_dbIndex;
    private $_dbFullTextIndex;
    private $_dbAutoIncrement;
    private $_dbNull;
    private $_dbNotNull;

    private $_dbType;
    private $_aliasType;

    protected $_typesMaxLength = array(
        "TINYINT" => 4,
        "INT" => 11,
        "DOUBLE" => 53,
        "VARCHAR" => 255,
        "TEXT" => null,
        "DATE" => null,
        "DATETIME" => null,
    );

    public function getDbLength(){
        return $this->_dbLength;
    }

    public function getDbType(){
        return $this->_dbType;
    }

    public function getAliasType(){
        return $this->_aliasType;
    }

    public function getUnsigned(){
        return $this->_dbUnsigned;
    }

    public function getDefault(){
        return $this->_dbDefault;
    }

    function getIndex(){
        return $this->_dbIndex;
    }
    function getUnique(){
        return $this->_dbUnique;
    }

    function getFullText(){
        return $this->_dbFullTextIndex;
    }

    function setDefault($v){
        $this->_dbDefault = $v;
        return $this;
    }

    function notNull(){
        $this->_dbNotNull = true;
        return $this;
    }

    function null(){
        $this->_dbNull = true;
        return $this;
    }

    function index($v){
        $this->_dbIndex = $v;
        return $this;
    }

    function unsigned(){
        $this->_dbUnsigned = true;
        return $this;
    }

    function unique(){
        $this->_dbUnique = true;
        return $this;
    }

    function fullText(){
        if(!is_null($this->_dbFullTextIndex)){
            trigger_error("you mustn't use fullText twice");
            exit;
        }
        $this->_dbFullTextIndex = true;
        return $this;
    }

    protected function primary(){
        if(!is_null($this->_dbPrimary)){
            trigger_error("you mustn't use primary twice");
            exit;
        }
        $this->_dbPrimary = true;
        return $this;
    }

    function getPrimary(){
        return $this->_dbPrimary;
    }

    protected function autoIncrement(){
        if(!is_null($this->_dbAutoIncrement)){
            trigger_error("you mustn't use auto_increment twice");
            exit;
        }
        $this->_dbAutoIncrement = true;
        return $this;
    }

    function getAutoIncrement(){
        return $this->_dbAutoIncrement;
    }

    function getNull(){
        return $this->_dbNull;
    }

    function getNotNull(){
        return $this->_dbNotNull;
    }

    private function _setType($TYPE, $len, $aliasType = null){

        $TYPE = strtoupper($TYPE);

        $this->_dbType = $TYPE;
        if(is_null($aliasType)){
            $aliasType = $TYPE;
        }
        $aliasType = strtoupper($aliasType);
        $this->_aliasType = $aliasType;

        $this->_dbLength = null;

        if(is_null($len)){
            $len = isset($this->_typesMaxLength[$TYPE]) ? $this->_typesMaxLength[$TYPE] : null;
        }

        if(!is_null($len)){
            $this->_dbLength = $len;
        }

        return $this;
    }

    function tinyint($len = null){
        return $this->_setType(self::dTYPE_TINYINT, $len);
    }

    function isTinyint(){
        return $this->_aliasType == self::aTYPE_TINYINT;
    }

    function int($len = null){
        return $this->_setType(self::dTYPE_INT, $len);
    }

    function isInt(){
        return $this->_aliasType == self::aTYPE_INT;
    }

    function double($len = null){
        return $this->_setType(self::dTYPE_DOUBLE, $len);
    }

    function isDouble(){
        return $this->_aliasType == self::aTYPE_DOUBLE;
    }

    function varchar($len = null){
        return $this->_setType(self::dTYPE_VARCHAR, $len);
    }

    function isVarchar(){
        return $this->_aliasType == self::aTYPE_VARCHAR;
    }

    function text(){
        return $this->_setType(self::dTYPE_TEXT, null);
    }

    function isText(){
        return $this->_aliasType == self::aTYPE_TEXT;
    }

    function date(){
        return $this->_setType(self::dTYPE_DATE, null);
    }

    function isDate(){
        return $this->_aliasType == self::aTYPE_DATE;
    }

    function datetime(){
        return $this->_setType(self::dTYPE_DATETIME, null);
    }

    function isDatetime(){
        return $this->_aliasType == self::aTYPE_DATETIME;
    }

    function bool(){
        return $this->_setType(self::dTYPE_BOOL, 1, self::aTYPE_BOOL);
    }

    function isBool(){
        return $this->_aliasType == self::aTYPE_BOOL;
    }

}