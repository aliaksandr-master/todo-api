<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends ApiController {

    public function __construct(){
        parent::__construct();
        $this->load->library('email');
        $this->load->helper('email');
        $this->load->helper('url');
    }

    public function logout_get(){
        $id = $this->user->current('id');
        $this->user->logout();
        return array(
            'status' => (bool)$id
        );
    }

    public function login_post(){
        $password = $this->user->cryptPassword($this->input('password'));
        $user = $this->user->read(array(
            'username' => $this->input("username"),
            'password' => $password
        ));
        if(empty($user[0])){
            $user = $this->user->read(array(
                'email' => $this->input("username"),
                'password' => $password
            ));
        }
        if(empty($user[0])){
            $this->api->input->error('username', 'incorrect');
            $this->api->input->error('password', 'incorrect');
            return null;
        }else{
            $this->user->login($user[0]);
        }
        return $user[0];
    }

    public function current_get(){
        return $this->user->current();
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

    public function index_put($id){
        $data = $this->api->input->pipe($this->user->safeFieldsMap());
        if($this->input('password_new')){
            $data['password'] = $this->input('password_new');
        }
        $this->user->update($data, $id);
        return $this->getOne($id);
    }

    public function index_delete($id){
        $user = $this->user->read($id);
        if(empty($user)){
            $this->api->output->error(404);
        }else{
            $this->user->delete($id);
        }
        return array(
            "status" => !empty($user)
        );
    }

    public function index_post(){
        $data = $this->api->input->pipe($this->user->safeFieldsMap());
        $data['password'] = $this->user->cryptPassword($data['password']);
        $data['date_register'] = date("Y-m-d H:i:s", gettimeofday(true));
        $activationCode = sha1(md5(microtime()));
        $data['activation_code'] = $activationCode;
        $userId = $this->user->create($data);
        return $this->getOne($userId);
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
    }

//    public function confirm_get(){
//
//        if(!empty($this->_get_args)){
//            //            $user = new User_model();
//        }
//
//    }

    public function _rule__valid_password ($value, $fieldName) {
        $id = $this->input("id");
        $data = $this->user->read(array(
            'password' => $this->user->cryptPassword($value),
            'id' => $id
        ));
        return !empty($data);
    }
    public function _rule__exists($value, $fieldName){
        $data = $this->user->read(array(
            $fieldName => $value
        ));
        return !empty($data);
    }

    public function _rule__unique($value, $fieldName){
        $data = $this->user->read(array(
            $fieldName => $value
        ));
        if(empty($data)){
            return true;
        }
        $id = $this->input("id");
        if (!$id) {
            return false;
        }
        if(count($data) == 1 && $data[0]['id'] == $id){
            return true;
        }
        return false;
    }

}