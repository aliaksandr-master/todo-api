<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class Todo extends REST_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Todo_model');
        $this->loader()->model('TodoItem_model');
        $this->loader()->library('data_transfer/Data_transfer');
    }

    public function list_get($id = null){
        $dataTransfer = new Data_Transfer();
        $todoObject = new Todo_model();
        $where = null;
        if (!is_null($id)) {
            $where = array('id' => $id);
        }
        $todoArray = $todoObject->read($where);
        $dataTransfer->data('list', $todoArray);
        $this->response($dataTransfer->getAllData());
    }

    public function list_post(){
        $dataTransfer = new Data_Transfer();
        if(empty($this->_post_args['name'])){
            $dataTransfer->error()->field('name', 'required');
        } else {
            $data = array();
            $data['name'] = trim($this->post('name'));
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
            $data['link'] = md5(gettimeofday(true).rand(1,1100)).gettimeofday(true);

            $todoObject = new Todo_model();
            $todoId = $todoObject->create($data);
            $dataTransfer->data('todo_id', $todoId);
        }
        $this->response($dataTransfer->getAllData());
    }

    public function item_get($todoId = null, $id = null){
        $dataTransfer = new Data_Transfer();
        $todoItemObject = new TodoItem_model();
        $where['todo_id'] = $todoId;
        if (!is_null($id)) {
            $where['id'] = $id;
        }
        $todoItemArray = $todoItemObject->read($where);
        $dataTransfer->data('item', $todoItemArray);
        $this->response($dataTransfer->getAllData());
    }

    public function item_post(){
        $dataTransfer = new Data_Transfer();
        if(empty($this->_post_args['name'])){
            $dataTransfer->error()->field('name', 'required');
        } else {
            $data = array();
            $data['todo_id'] = trim($this->post('todo_id'));
            $data['name'] = trim($this->post('name'));
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));

            $todoItemObject = new TodoItem_model();
            $todoItemId = $todoItemObject->create($data);
            $dataTransfer->data('item_id', $todoItemId);
        }
        $this->response($dataTransfer->getAllData());
    }


}