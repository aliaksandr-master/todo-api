<?php defined('BASEPATH') OR exit('No direct script access allowed');


class DataTransferErrorObject extends DataTransferMultiValueObject{

    public function __construct(){
        parent::__construct('error', false, self::TYPE_OBJECT);
    }

    public function field($name, $message){
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