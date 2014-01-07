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
    private $_input;
    private $_sourceInput;

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

        if(ENVIRONMENT == "development" && $this->_controller instanceof REST_Controller){

            $this->_input = new DataTransferMultiValueObject($this, 'input', false, DataTransferMultiValueObject::TYPE_OBJECT);

            $this->_input->setValue("url", $_SERVER['REQUEST_URI']);
            $this->_input->setValue("method", $_SERVER['REQUEST_METHOD']);
            $this->_input->setValue("sourceData", INPUT_DATA);

            $exploded = explode('&', INPUT_DATA);

            $_PUT = array();
            foreach($exploded as $pair) {
                $item = explode('=', $pair);
                if(count($item) == 2) {
                    $_PUT[urldecode($item[0])] = urldecode($item[1]);
                }
            }
            $this->_input->setValue("parsedData", $_PUT);
            $this->_input->setValue("argsData", $this->_controller->args());
        }
    }

    public function sendRestControllerResponse(){
        $this->_controller->response($this->getAllData(), $this->getCode());
    }

    public function toJSON(){
        return json_encode($this->getAllData());
    }

    public function getAllData(){
        $allData = array();
        $objects = array('code', 'status', 'data', 'error', "input");
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