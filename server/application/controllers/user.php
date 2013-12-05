<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends MY_Controller {

    /**
     * @var User_model
     */
    public $user;

    public function login(){

        $this->load->model('user_model', 'user');

        $data = $this->user->read();

        var_dump($data);
    }
}