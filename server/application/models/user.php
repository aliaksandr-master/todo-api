<?php

class User_model extends MY_Model {

    public function getTableFields(){
        return array('nick_name', 'password');
    }

    public function getTableName(){
        return "user";
    }
}