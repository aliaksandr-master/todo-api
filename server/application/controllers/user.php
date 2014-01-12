<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'/libraries/SmartyParams.php');
require_once(APPPATH.'/core/API_Controller.php');

class User extends API_Controller {

    /**
     * @var User_model
     */
    public $user;

    public function __construct(){
        parent::__construct();
        $this->loader()->model('User_model', "user");

        $this->loader()->library('email');
        $this->loader()->helper('email');
        $this->loader()->helper('url');
    }

    public function index_get($userId = null){
        // GET

    }

    public function index_post(){

        if(!valid_email($this->_input('email'))){
            $this->transfer()->error()->field('email', 'incorrect');
        }

        if(!$this->transfer()->hasError()){
            $data = array();

            $data['username']   = $this->_input('username');
            $data['email']      = $this->_input('email');
            $data['password']   = $this->_input('password');

            if($this->_input('confirm_password') != $data['password']) {
                $this->transfer()->error(400)->field('confirm_password', 'not_equal');
            }

            if($this->user->checkOnExistField('username', $data['username'])) {
                $this->transfer()->error(400)->field('username', 'exists');
            }

            if($this->user->checkOnExistField('email', $data['email'])) {
                $this->transfer()->error(400)->field('email', 'exists');
            }

            if(!$this->transfer()->hasError()){

                $data['password'] = md5($data['password']);

                $data['date_register'] = date("Y-m-d H:i:s", gettimeofday(true));

                $activationCode = sha1(md5(microtime()));

                $data['activation_code'] = $activationCode;

//                $emailObject = $this->email;
//                /*
//                 * @var CI_Email $emailObject
//                 */
//                $emailObject->from('admin@dev.listslider.kreantis.com', 'Administrator');
//                $emailObject->to('alex@google.com');
//                $emailObject->subject('Account activation');
//                $href = base_url().$this->uri->segment(1).'/confirm/'.sha1(md5(microtime()));
//                $message = 'To confirm your registration go to the link below <br><a href="'.$href.'">Confirm</a>';
//                $emailObject->message($message);
//                $emailObject->send();

                $userId = $this->user->create($data);

                $data = $this->user->read(array("id" => $userId));

                $this->transfer($data);
            }
        }
    }

    // TODO method must be named as 'login_put'
    public function login_post(){
        $userName = $this->_input("username");
        $password = $this->_input("password");

        $userObject = new User_model();
        $userArray = $userObject->read(array('username' => $userName));

        if(empty($userArray)){
            $userArray = $userObject->read(array('email' => $userName));
        }

        if(empty($userArray[0])){
            $this->transfer()->code(404);
            $this->transfer()->error()->field('username', 'incorrect');
        }else{
            if(md5($password) == $userArray[0]['password']){
                $this->transfer($userArray);
            }else{
                $this->transfer()->error()->field('password', 'incorrect');
            }
        }
    }

    public function confirm_get(){

        if(!empty($this->_get_args)){
//            dump($this->_get_args);
//            $user = new User_model();
        }

    }

}