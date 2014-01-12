<?php defined('BASEPATH') OR exit('No direct script access allowed');


class DataTransferSimpleValueObject{

    private $_name;
    private $_value;
    private $_optional;

    /**
     * @var DataTransfer
     */
    protected $_root;

    public function __construct($root, $name, $optional = false, $defaultValue = null){
        $this->_name = $name;
        $this->_root = $root;
        $this->_optional = (bool) $optional;
        $this->_value = $defaultValue;
    }

    public function setValue($value){
        $this->_value = $value;
        return $this;
    }

    public function getName(){
        return $this->_name;
    }

    public function getValue(){
        return $this->_value;
    }

    public function getResult(){
        $data = $this->getValue();
        if($this->isOptional() && empty($data)){
            return null;
        }
        return $data;
    }

    public function isOptional(){
        return $this->_optional;
    }

}