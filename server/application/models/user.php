<?php

class User extends MY_Model {

    public function setTableFields(){
        return array('*');
    }

    public function setTableName(){
        return "user";
    }
}