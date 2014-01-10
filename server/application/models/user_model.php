<?php

class User_model extends MY_Model {

    public function __construct(){
        parent::__construct();
    }

    public function getTableName(){
        return array("user");
    }

    public function getTableFields(){
        return array('username', 'password', 'date_register', 'email', 'activated', 'activation_code');
    }



}