<?php

class User_model extends MY_Model {

    public function getTableName(){
        return array("user");
    }

    public function getTableFields(){
        return array('username', 'password', 'date_register');
    }
}