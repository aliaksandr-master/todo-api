<?php defined('BASEPATH') OR exit('No direct script access allowed');

require_once('DataTransferSimpleValueObject.php');
require_once('DataTransferMultiValueObject.php');
require_once('DataTransferErrorObject.php');

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

    private $_status;
    private $_code;
    private $_data;
    private $_error;

    /**
     * @var REST_Controller
     */
    private $_controller;

    public function __construct(&$controller){
        $this->_status = new DataTransferSimpleValueObject($this, 'status', false, true);
        $this->_code = new DataTransferSimpleValueObject($this, 'code', false, 200);
        $this->_data = new DataTransferMultiValueObject($this, 'data', false);
        $this->_error = new DataTransferErrorObject($this);
        $this->_controller = $controller;
    }

    public function sendRestControllerResponse(){
        $this->_controller->response($this->getAllData(), $this->getCode());
    }

    public function toJSON(){
        return json_encode($this->getAllData());
    }

    public function getAllData(){
        $allData = array();
        $objects = array('code', 'status', 'data', 'error');
        foreach ($objects as $name) {
            $object = '_'.$name;
            $data = $this->$object->getResult();
            if (!is_null($data)){
                $key = $this->$object->getName();
                $allData[$key] = $data;
            }
        }
        return $allData;
    }

    public function sendResponse(){
        exit($this->toJSON());
    }

    public function error(){
        $this->_status->setValue(false);
        return $this->_error;
    }

    public function data($name, $value = null){
        if(is_object($name)){
            $name = (array) $name;
        }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
            $arr = array();
            $arr[$name] = $value;
            $name = $arr;
        }

        if(!is_array($name)){
            throw new Exception("invalid data format");
        }

        foreach($name as $n => $v){
            $this->_data->setValue($n,$v);
        }
        return $this;
    }

    public function code($code){
        $this->_code->setValue($code);
        return $this;
    }

    public function getCode(){
        return $this->_code->getValue();
    }

    public function hasError(){
        return (bool)$this->error()->getResult();
    }

}