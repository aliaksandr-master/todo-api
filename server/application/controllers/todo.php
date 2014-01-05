<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class Todo extends REST_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Todo_model');
        $this->loader()->library('data_transfer/Data_transfer');
    }

    public function list_get($arg = null){
        $dataTransfer = new Data_Transfer();
        $todoObject = new Todo_model();
        $where = null;
        if (!empty($arg)) {
            $where = array('id' => $arg);
        }
        $todoArray = $todoObject->read($where);
        $dataTransfer->data('todo_lists', $todoArray);
        $this->response($dataTransfer->getAllData());
    }

    public function list_post(){
        $dataTransfer = new Data_Transfer();
        if(empty($this->_post_args['name'])){
            $dataTransfer->error()->field('name', 'required');
        } else {
            $data = array();
            $data['name'] = trim($this->post('name'));
            $data['date_creation'] = date("Y-m-d h:i:s", gettimeofday(true));
            $data['sort_order'] = $this->post('sort_order');

            $todoObject = new Todo_model();
            $todoId = $todoObject->create($data);
            $dataTransfer->data('todo_id', $todoId);
        }
        $this->response($dataTransfer->getAllData());
    }

    public function item_get($arg = null){

        $dataTransfer = new Data_Transfer();
        if(empty($this->_post_args['name'])){
            $dataTransfer->error()->field('name', 'required');
        } else {
            $data = array();
            $data['name'] = trim($this->post('name'));
            $data['date_creation'] = date("Y-m-d h:i:s", gettimeofday(true));
            $data['sort_order'] = $this->post('sort_order');

            $todoObject = new Todo_model();
            $todoId = $todoObject->create($data);
            $dataTransfer->data('todo_id', $todoId);
        }
        $this->response($dataTransfer->getAllData());
    }

}