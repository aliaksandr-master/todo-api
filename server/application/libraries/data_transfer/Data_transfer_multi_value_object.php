<?php defined('BASEPATH') OR exit('No direct script access allowed');


class DataTransferMultiValueObject extends DataTransferSimpleValueObject{

    const TYPE_ARRAY = 'array';
    const TYPE_OBJECT = 'object';

    private $_type;

    public function __construct($name, $optional = false, $type = self::TYPE_ARRAY){
        parent::__construct($name, $optional, array());
        $this->_type = $type;
    }

    public function setValue($name, $value){
        $data = parent::getValue();
        if (is_null($name) && $this->_type == self::TYPE_ARRAY){
            $data[] = $value;
        } else {
            $data[$name] = $value;
        }
        parent::setValue($data);
    }

    public function getValue($name, $default = null){
        $data = parent::getValue();
        return isset($data[$name]) ? $data[$name] : $default;
    }

    public function getAll(){
        if($this->_type == self::TYPE_ARRAY){
            return (array) parent::getValue();
        }
        return (object) parent::getValue();
    }

    public function getResult(){
        $data = $this->getAll();
        if($this->isOptional() && empty($data)){
            return null;
        }
        return $data;
    }



}