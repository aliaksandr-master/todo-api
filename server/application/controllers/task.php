<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class Task extends REST_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Task_model');
    }

    public function create() {
    }
}