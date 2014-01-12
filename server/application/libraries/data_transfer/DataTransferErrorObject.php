<?php defined('BASEPATH') OR exit('No direct script access allowed');


class DataTransferErrorObject extends DataTransferMultiValueObject{


    public function __construct(DataTransfer $root, $optional = false){
        parent::__construct($root, 'error', $optional, self::TYPE_OBJECT);
    }

    public function field($name, $message){
        if(!$this->_root->hasError()){
            $this->_root->code(400);
        }
        $data = $this->getValue('field', new DataTransferMultiValueObject('field', true, self::TYPE_ARRAY));
        if($data instanceof DataTransferMultiValueObject){
            $data->setValue(null, array(
                'name' => $name,
                'message' => $message
            ));
        }

        $this->setValue('field', $data);
        return $this;
    }

    public function access($type, $message){
        if(!$this->_root->hasError()){
            $this->_root->code(401);
            $this->_root->status(false);
        }
        $data = $this->getValue('access', new DataTransferMultiValueObject('access', true, self::TYPE_ARRAY));
        if($data instanceof DataTransferMultiValueObject){
            $data->setValue(null, array(
                'type' => $type,
                'message' => $message
            ));
        }

        $this->setValue('access', $data);
        return $this;
    }

    public function getResult(){
        $data = $this->getAll();
        $dataArray = array();
        foreach ($data as $obj){
            $dataArray[$obj->getName()] = $obj->getResult();
        }
        return $dataArray;
    }

}