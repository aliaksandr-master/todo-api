<?php defined('BASEPATH') OR exit('No direct script access allowed');

require_once('Data_transfer_simple_value_object.php');
require_once('Data_transfer_multi_value_object.php');
require_once('Data_transfer_error_object.php');

///**
// * DataTransfer class
// *
// * Used to transfer data between server and browser in the JSON format.
// *
// * @author Pasynkov Alexandr & Karpovich Alexandr
// * @package server\application\libraries\data_transfer\
// *
// */

class Data_transfer{

    private $_url;
    private $_code;
    private $_format;
    private $_method;
    private $_data;
    private $_content;
    private $_error;

    public function __construct(){
        $ci = &get_instance();
        $ci->load->helper('url');
        $this->_url = new DataTransferSimpleValueObject('url', false, uri_string().'/');
        $this->_code = new DataTransferSimpleValueObject('code', false, 200);
        $this->_format = new DataTransferSimpleValueObject('format', false, 'json');
        $this->_method = new DataTransferSimpleValueObject('method', false, 'post');
        $this->_data = new DataTransferMultiValueObject('data', true, DataTransferMultiValueObject::TYPE_OBJECT);
        $this->_content = new DataTransferSimpleValueObject('content', true, '');
        $this->_error = new DataTransferErrorObject();
    }

    public function toJSON(){
        return json_encode($this->getAllData());
    }

    public function getAllData(){
        $allData = array();
        $objects = array('url', 'code', 'format', 'method', 'data', 'content', 'error');
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
        return $this->_error;
    }

    public function content($content){
        $this->_content->setValue($content);
        return $this;
    }

    public function url($url){
        $this->_url->setValue($url);
        return $this;
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

    public function method($method){
        $this->_method->setValue($method);
        return $this;
    }

    public function format($format){
        $this->_format->setValue($format);
        return $this;
    }

    public function hasError(){
        return (bool)$this->error()->getResult();
    }



}