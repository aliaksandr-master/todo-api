<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class User extends REST_Controller {

    public function __construct(){
        parent::__construct();
        $this->loader()->model('User_model');
        $this->loader()->library('data_transfer/Data_transfer');
        $this->loader()->library('email');
        $this->loader()->helper('email');
        $this->loader()->helper('url');
    }

    public function register_post(){

        $dataTransfer = new Data_transfer();

        foreach($this->_post_args as $name => $value){
            if(empty($value)){
                $dataTransfer->error()->field($name, 'required');
            }
        }
        if(!valid_email($this->post('email'))){
            $dataTransfer->error()->field('email', 'incorrect_format');
        }

        $checkErrors = $dataTransfer->error()->getResult();
        if(!$checkErrors){
            $data = array();
            $data['username'] = trim($this->post('username'));
            $data['email'] = strtolower(trim($this->post('email')));
            $data['password'] = trim($this->post('password'));
            if($this->checkTableField('username', $data['username'])) {
                $dataTransfer->error()->field('username', 'exists');
            }
            if($this->checkTableField('email', $data['email'])) {
                $dataTransfer->error()->field('email', 'exists');
            }
            if(trim($this->post('confirm_password')) != $data['password']) {
                $dataTransfer->error()->field('confirm_password', 'not_equal');
            }

            $checkErrors = $dataTransfer->error()->getResult();
            if(!$checkErrors){
                $data['password'] = md5($data['password']);
                $data['date_register'] = date("Y-m-d h:i:s", gettimeofday(true));
                $activationCode = sha1(md5(microtime()));
                $data['activation_code'] = $activationCode;

                $emailObject = $this->email;
                if($emailObject instanceof CI_Email) {
                    $emailObject->from('admin@dev.listslider.kreantis.com', 'Administrator');
                    $emailObject->to('alex@google.com');
                    $emailObject->subject('Account activation');
                    // http://listslider/server/user/confirm/...
                    $href = base_url().$this->uri->segment(1).'/confirm/'.sha1(md5(microtime()));
                    $message = 'To confirm your registration go to the link below <br><a href="'.$href.'">Confirm</a>';
                    $emailObject->message($message);
                    $emailObject->send();
                }

                $user = new User_model();
                $userId = $user->create($data);
                $dataTransfer->data('user_id', $userId);
            }
        }
        $this->response($dataTransfer->getAllData());
    }

    // TODO method must be named as 'login_put'
    public function login_post(){
        $dataTransfer = new Data_Transfer();

        foreach($this->_post_args as $name => $value){
            if(empty($value)) {
                $dataTransfer->error()->field($name, 'required');
            }
        }

        $checkErrors = $dataTransfer->error()->getResult();
        if(!$checkErrors) {
            $putUsername = strtolower(trim($this->post('username')));
            $putPassword = trim($this->post('password'));
            $userObject = new User_model();
            $userArray = $userObject->read(array('username' => $putUsername));
            $user = current($userArray);
            if(!empty($user)){
                if(md5($putPassword) == $user['password']){
                    // TODO hash string
                    $dataTransfer->data('session_id', 'hash string');
                }else{
                    $dataTransfer->error()->field('password', 'incorrect');
                }
            }else{
                $dataTransfer->error()->field('username', 'not_found');
            }
        }
        $this->response($dataTransfer->getAllData());
    }

    public function confirm_get(){

        if(!empty($this->_get_args)){
//            dump($this->_get_args);
//            $user = new User_model();
        }

    }

//    public function test_get(){
//        $emailObject = $this->email;
//        if($emailObject instanceof CI_Email) {
//            $emailObject->from('admin@dev.listslider.kreantis.com', 'Administrator');
//            $emailObject->to('alex@google.com');
//            $emailObject->subject('Account activation');
//            // http://listslider/server/user/confirm/...
//            $href = base_url().$this->uri->segment(1).'/confirm/activation_code/'.sha1(md5(microtime()));
//            $message = 'To confirm your registration go to the link below <br><a href="'.$href.'">Confirm</a>';
//            $emailObject->message($message);
//            $emailObject->send();
//        }
//        echo($message);
//    }

}