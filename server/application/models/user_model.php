<?php

class User_model extends MY_Model {

    public function getTableFields(){
        return array('username', 'password');
    }

    public function getTableName(){
        return "user";
    }
}