<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends MY_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('User_model');
    }


    public function login(){

        if (!empty($_POST['username']) && !empty($_POST['password'])) {

            $user = new User_model();
            $data = $user->read();

            // match the username from POST with existing usernames in database
            foreach ($data as $key => $value) {
                if ($_POST['username'] == $value['username']) {
                    $userKey = $key;
                    break;
                }
            }

            if (!isset($arrKey)) {
                return var_dump('There is no such user');
            } elseif(md5($_POST['password']) != $data[$userKey]['password']) {
                return var_dump('Wrong password');
            }

            return var_dump('Well done!');
        }

        return var_dump('Fill all fields');
    }

    public function register() {

        if (!empty($_POST['username']) && !empty($_POST['password'])) {

            $data = array();
            $data['username'] = $_POST['username'];
            $data['password'] = md5($_POST['password']);
            if (!empty($_POST['date_register'])) $data['date_register'] = $_POST['date_register'];

            $user = new User_model();

            return $user->create($data);

        } else {

          return var_dump('Fill all fields');
        }

    }
}