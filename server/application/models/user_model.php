<?php

class User_model extends MY_Model {

    public function getTableFields(){
        return array('username', 'password', 'date_register');
    }

    public function getTableName(){
        return "user";
    }
}