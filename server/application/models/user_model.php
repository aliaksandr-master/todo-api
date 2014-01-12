<?php

class User_model extends MY_Model {

    public function getTableName(){
        return "user";
    }

    public function getTableFields(){
        return array(
            'id',
            'username',
            'password',
            'date_register',
            'email',
            'activated',
            'activation_code'
        );
    }

    public function checkOnExistField ($name, $value){
        $user = $this->read(array(
            $name => $value
        ));
        return !empty($user);
    }

}