<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class Todo extends REST_Controller {

    public function __construct() {
        parent::__construct();
//        $this->loader()->model('Task_model');
    }

    public function list_get() {
//        dump($this->_get_args);

//        $this->response($this->_get_args);
        $this->loader()->view('todo');
    }
}