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

        $this->load->model('User_model', "user");
        $this->load->library('email');
        $this->load->helper('email');
        $this->load->helper('url');
    }

    public function login_post(){
        $userArray = $this->user->read(array('username' => $this->api()->input("username")));

        if(empty($userArray)){
            $userArray = $this->user->read(array('email' => $this->api()->input("username")));
        }

        if(empty($userArray[0])){
            $this->transfer()->error(404)->field('username', 'incorrect');
        }else{
            if(md5($this->api()->input("password")) == $userArray[0]['password']){
                $this->transfer($userArray);
            }else{
                $this->transfer()->error(404)->field('password', 'incorrect');
            }
        }
    }

    public function getOne($userId){
        return $this->user->read($userId);
    }

    public function getAll(){
        return $this->user->read();
    }

    public function index_get($userId = null){
        return is_null($userId) ? $this->getAll() : $this->getOne($userId);
    }

    public function index_put(){
        $data = array();
        $data['username']   = $this->api()->input('username');
        $data['email']      = $this->api()->input('email');
        $data['password']   = $this->api()->input('password');

    }

    public function index_post(){
        $data = array();
        $data['username']   = $this->api()->input('username');
        $data['email']      = $this->api()->input('email');
        $data['password']   = $this->api()->input('password');

        if($this->api()->input('confirm_password') != $data['password']) {
            $this->transfer()->error(400)->field('confirm_password', 'not_equal');
        }

        if($this->user->checkOnExistField('username', $data['username'])) {
            $this->transfer()->error(400)->field('username', 'exists');
        }

        if(!$this->transfer()->hasError()){
            $data['password'] = md5($data['password']);
            $data['date_register'] = date("Y-m-d H:i:s", gettimeofday(true));

            $activationCode = sha1(md5(microtime()));
            $data['activation_code'] = $activationCode;
//          $emailObject = $this->email;
//          /*
//          * @var CI_Email $emailObject
//          */
//          $emailObject->from('admin@dev.listslider.kreantis.com', 'Administrator');
//          $emailObject->to('alex@google.com');
//          $emailObject->subject('Account activation');
//          $href = base_url().$this->uri->segment(1).'/confirm/'.sha1(md5(microtime()));
//          $message = 'To confirm your registration go to the link below <br><a href="'.$href.'">Confirm</a>';
//          $emailObject->message($message);
//          $emailObject->send();
            $userId = $this->user->create($data);
            $this->transfer($this->getOne($userId));
        }
    }

    public function confirm_get(){

        if(!empty($this->_get_args)){
            //            $user = new User_model();
        }

    }

}