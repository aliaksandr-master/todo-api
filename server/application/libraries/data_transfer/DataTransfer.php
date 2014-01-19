<?php defined('BASEPATH') OR exit('No direct script access allowed');


///**
// * DataTransfer class
// *
// * Used to transfer data between server and browser in the JSON format.
// *
// * @author Pasynkov Alexandr & Karpovich Alexandr
// * @package server\application\libraries\data_transfer\
// *
// */

class DataTransfer{

    private $_code = null;
    private $_data;
    private $_error;
    private $_input;

    /**
     * @var ApiController
     */
    private $_controller;

    public function __construct(&$controller){
        $this->_controller = $controller;

        $this->_code = null;
        $this->_data = new DataTransferMultiValueObject($this, 'data', false);
        $this->_error = new DataTransferErrorObject($this);
    }

    public function toJSON(){
        return json_encode($this->getAllData());
    }

    public function getAllData(){
        $allData = array();
        $objects = array('data', 'error', "input");
        $allData['code'] = $this->getCode();
        foreach ($objects as $name) {
            $object = '_'.$name;
            if(isset($this->$object)){
                $data = $this->$object->getResult();
                if (!is_null($data)){
                    $key = $this->$object->getName();
                    $allData[$key] = $data;
                }
            }
        }
        return $allData;
    }

    public function sendResponse(){
        exit($this->toJSON());
    }

    public function error($code = null){
        if(!is_null($code)){
            $this->code($code);
        }
        return $this->_error;
    }

    public function data($name = null, $value = null){
        if(!is_null($name)){
            if(is_object($name)){
                $name = (array) $name;
            }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
                $arr = array();
                $arr[$name] = $value;
                $name = $arr;
            }

            if(!is_array($name)){
                trigger_error("invalid data format", E_USER_WARNING);
                die('');
            }

            foreach($name as $n => $v){
                $this->_data->setValue($n,$v);
            }
        }
        return $this->_data;
    }

    public function code($code = null){
        if(!is_null($code)){
            if($this->codeWasSet()){
                if($this->_code < 400){
                    $this->_code = $code;
                }
            } else {
                $this->_code = $code;
            }
        }
        return $this;
    }

    public function codeWasSet(){
        return isset($this->_code);
    }

    public function getCode(){
        return isset($this->_code) ? $this->_code : 200;
    }

    public function hasError(){
        if((bool)$this->error()->getResult()){
            return true;
        }
        if($this->_code>=400){
            return true;
        }
        return false;
    }

}