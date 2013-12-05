<?php

class User_Model extends MY_Model {

    public function setTableFields(){
        return array('*');
    }

    public function setTableName(){
        return "user";
    }
}