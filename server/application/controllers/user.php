<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends MY_Controller {

    public function __construct(){
        parent::__construct();
        $this->loader()->model('User_model');
        $this->loader()->library('data_transfer/DataTransfer');
        $this->loader()->helper('email');
        $this->loader()->helper('url');
        $this->loader()->library('email');
    }

    public function login(){
        $dataTransfer = new DataTransfer();
        if(empty($_POST['username'])) $dataTransfer->error()->field('username', 'Fill Username field');
        if(empty($_POST['password'])) $dataTransfer->error()->field('password', 'Fill Password field');

        $checkErrors = $dataTransfer->error()->getResult();
        if(!$checkErrors) {
            $postUsername = trim($_POST['username']);
            $postPassword = trim($_POST['password']);
            $userObject = new User_model();
            $userArray = $userObject->read(array('username' => $postUsername));
            $user = current($userArray);
            if(!empty($user) && $postUsername == $user['username']) {
                if(md5($postPassword) == $user['password']){
                    $dataTransfer->data('username', $user['username']);
                }else{
                    $dataTransfer->error()->field('password', 'Wrong password');
                }
            }else{
                $dataTransfer->error()->field('username', 'Wrong username');
            }
        }
        $dataTransfer->sendResponse();
    }

    public function register(){

        $dataTransfer = new DataTransfer();

        if(empty($_POST['username'])) $dataTransfer->error()->field('username', 'Fill Username field');
        if(empty($_POST['email'])) $dataTransfer->error()->field('email', 'Fill Email field');
        if(empty($_POST['password'])) $dataTransfer->error()->field('password', 'Fill Password field');
        if(empty($_POST['confirm_password'])) $dataTransfer->error()->field('confirm_password', 'Fill Confirm password field');
        if(!valid_email($_POST['email'])) $dataTransfer->error()->field('email', 'Email is not valid');

        $checkErrors = $dataTransfer->error()->getResult();
        if(!$checkErrors){
            $postUsername = trim($_POST['username']);
            $postEmail = strtolower(trim($_POST['email']));
            $postPassword = trim($_POST['password']);
            $postConfirmPassword = trim($_POST['confirm_password']);
            if($this->checkTableField('username', $postUsername)) $dataTransfer->error()->field('username', 'The user already exists');
            if($this->checkTableField('email', $postEmail)) $dataTransfer->error()->field('email', 'User with the email already exists');
            if($postConfirmPassword != $postPassword) $dataTransfer->error()->field('confirm_password', 'Wrong confirm password');

            $checkErrors = $dataTransfer->error()->getResult();
            if(!$checkErrors){
                $data = array();
                $data['username'] = $postUsername;
                $data['email'] = $postEmail;
                $data['password'] = md5($postPassword);
                $data['date_register'] = date("Y-m-d h:i:s", gettimeofday(true));
                $activationCode = sha1(md5(microtime()));
                $data['activation_code'] = $activationCode;

                $emailObject = $this->email;
                if($emailObject instanceof CI_Email) {
                    $emailObject->from('admin@dev.listslider.kreantis.com/', 'Administrator');
                    $emailObject->to($postEmail);
                    $emailObject->subject('Account activation');
                    $emailObject->message('Some text');
                    $emailObject->send();
                }

                $user = new User_model();
                $user->create($data);

                $dataTransfer->data('username', $postUsername);
            }
        }

        $dataTransfer->sendResponse();
    }

    private function checkTableField($name, $value){
        $userObject = new User_model();
        $user = $userObject->read(array($name => $value));
        return (!empty($user)) ? true : false;
    }


}