<?php defined('BASEPATH') OR exit('No direct script access allowed');


class DataTransferErrorObject extends DataTransferMultiValueObject{

    private $_field = array();
    private $_access = array();

    public function __construct(DataTransfer $root, $optional = false){
        parent::__construct($root, 'error', $optional, self::TYPE_OBJECT);
    }

    public function isEmpty(){
        return empty($this->_field) && empty($this->_access);
    }

    public function field($name, $message = null){
        $arr = $name;
        if(!is_array($name)){
            $arr = array(
                $name => $message
            );
        }
        if(!$this->_root->hasError()){
            $this->_root->code(400);
        }
        foreach($arr as $name => $value){
            $this->_field[] = array(
                'name' => $name,
                'message' => $value
            );
        }
        return $this;
    }

    public function access($name, $message = null){
        $arr = $name;
        if(!is_array($name)){
            $arr = array(
                $name => $message
            );
        }
        if(!$this->_root->hasError()){
            $this->_root->code(403);
        }
        foreach($arr as $name => $value){
            $this->_access[] = array(
                'name' => $name,
                'message' => $value
            );
        }
        return $this;
    }

    public function getResult(){
        $dataArray = array();
        if(!empty($this->_field)){
            $dataArray['field'] = $this->_field;
        }
        if(!empty($this->_access)){
            $dataArray['access'] = $this->_access;
        }
        return $dataArray;
    }

}