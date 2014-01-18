<?php

class User_model extends BaseCrudModel {

    public function getTableName(){
        return "user";
    }

    public function cryptPassword($value){
        return md5($value);
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


}