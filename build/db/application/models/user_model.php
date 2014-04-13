<?php

class UserModel extends BaseCrudModel {

    const USER = "user";

    public function cryptPassword($value){
        return md5($value);
    }

    public function current($dataName = null, $default = null){
        if(!is_null($dataName)){
            return isset($_SESSION[self::USER][$dataName]) ? $_SESSION[self::USER][$dataName] : $default;
        }
        return isset($_SESSION[self::USER]) ? $_SESSION[self::USER] : array();
    }

    public function login($user){
        if($user){
            $_SESSION[self::USER] = $user;
        }
    }

    public function logout(){
        unset($_SESSION[self::USER]);
        $_SESSION[self::USER] = array();
    }

    public function isLogged(){
        return !empty($_SESSION[self::USER]);
    }
}