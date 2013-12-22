<?php defined('BASEPATH') OR exit('No direct script access allowed');

require_once('DataTransferSimpleValueObject.php');
require_once('DataTransferMultiValueObject.php');
require_once('DataTransferErrorObject.php');

/**
 * DataTransfer class
 *
 * Used to transfer data between server and browser in the JSON format.
 *
 * @author Karpovich Alexandr & Pasynkov Alexandr
 * @package server\application\libraries\data_tranfer\
 *
 */

class DataTransfer{

    private $_url;
    private $_code;
    private $_completed;
    private $_data;
    private $_content;
    private $_error;

    /**
     * Constructor
     *
     */
    public function __construct(){
        $ci = &get_instance();
        $ci->load->helper('url');
        $this->_url = new DataTransferSimpleValueObject('url', false, uri_string().'/');
        $this->_code = new DataTransferSimpleValueObject('code', false, 200);
        $this->_completed = new DataTransferSimpleValueObject('completed', false, true);
        $this->_data = new DataTransferMultiValueObject('data', true, DataTransferMultiValueObject::TYPE_OBJECT);
        $this->_content = new DataTransferSimpleValueObject('content', true, '');
        $this->_error = new DataTransferErrorObject();
    }

    public function toJSON(){
        return json_encode($this->getAllData());
    }

    public function getAllData(){
        $allData = array();
        $objects = array('url', 'code', 'completed', 'data', 'content', 'error');
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
        $this->completed(false);
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

    public function data($name,$value){
        $this->_data->setValue($name,$value);
        return $this;
    }

    public function code($code){
        $this->_code->setValue($code);
        return $this;
    }

    public function completed($completed){
        if($this->_completed->getValue()){
            $this->_completed->setValue($completed);
        }
        return $this;
    }



}