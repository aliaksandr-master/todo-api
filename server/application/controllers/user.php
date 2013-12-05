<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends MY_Controller {

    public function login(){

        $user = new User();
        $userData = $user->read();

        return $userData;
    }
}