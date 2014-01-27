<?php

class SmartyParams implements arrayaccess {

    private $_params;
    private $_isModifiable;

    function __construct($params, $isModifiable = true){
        $this->_params = $params instanceof SmartyParams ? $params->getParams() : $params;
        $this->_isModifiable = $isModifiable;
    }

    function defaults($name, $value=null){
        $arr = $name;
        if(!is_array($name)){
            $arr = array();
            $arr[$name] = $value;
        }
        foreach($arr as $name => $value){
            $this->_params[$name]=$this->get($name,$value);
        }
    }

    function test($name, $value, $strict=false){
        if(!is_array($value)){
            $value=array($value);
        }
        if(isset($this->_params[$name])){
            $v = $this->_params[$name];
            if($strict){
                foreach($value as $val){
                    if($val === $v){
                        return true;
                    }
                }
            }else{
                foreach($value as $val){
                    if($val == $v){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function required($param, $errorInstanceName = null){
        if(!is_array($param)){
            $param = array($param);
        }
        $errorEmpty = true;
        foreach($param as $requiredParamName){
            if(!isset($this->_params[$requiredParamName])){
                $errorEmpty = false;
                if($errorInstanceName){
                    $msg = $errorInstanceName ? $errorInstanceName.":" : "";
                    $msg = $msg." param ['".$requiredParamName."'] is required for correct work smarty plugin! Error!";
                    trigger_error($msg, E_USER_WARNING);
                }
            }
        }
        return $errorEmpty;
    }

    function map($func){
        $this->_params = array_map($func, $this->_params);
        return $this;
    }

    function get($name, $default = null){
        return isset($this->_params[$name]) ? $this->_params[$name] : $default;
    }

    function bool($name){
        return !empty($this->_params[$name]);
    }

    function exist($name){
        return isset($this->_params[$name]);
    }

    function set($name, $value){
        if(!$this->_isModifiable){
            trigger_error("params '".$name."' was not modified! ", E_USER_WARNING);
            return;
        }
        $this->_params[$name] = $value;
    }

    function delete($name){
        unset($this->_params[$name]);
    }

    function remove($name){
        $this->delete($name);
    }

    public function offsetSet($key, $value) {
        $this->set($key,$value);
    }

    public function offsetExists($key) {
        return isset($this->_params[$key]);
    }

    public function offsetUnset($key) {
        unset($this->_params[$key]);
    }

    public function offsetGet($key) {
        return $this->get($key,null);
    }

    public function getParams(){
        return $this->_params;
    }
}