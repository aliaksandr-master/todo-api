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

    /**
     * @var API_Controller
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
            $this->_input->setValue("argsData", $this->_controller->inputArguments());
        }

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
        return $this->_error;
    }

    public function status($value = null){
        if(!is_null($value)){
            if($this->_status->getValue()){
                $this->_status->setValue($value);
            }
        }
        return $this->_status;
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
        if(!is_null($code) && $this->_code->getValue() < 400){
            $this->_code->setValue($code);
            $this->status($this->_code->getValue() < 400);
        }
        return $this->_code;
    }

    public function getCode(){
        return $this->_code->getValue();
    }

    public function hasError(){
        if((bool)$this->error()->getResult()){
            return true;
        }
        if($this->getCode()>=400){
            return true;
        }
        return !$this->_status->getValue();
    }

}