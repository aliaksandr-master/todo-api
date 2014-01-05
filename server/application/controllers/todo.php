<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';
require APPPATH.'/libraries/SmartyParams.php';

class Todo extends REST_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Todo_model');
        $this->loader()->model('TodoItem_model');
        $this->loader()->library('data_transfer/Data_transfer');
    }

    public function index_get($id = null){
        $dataTransfer = new Data_Transfer();
        $todoObject = new Todo_model();
        $where = null;
        if (!is_null($id)) {
            $where = array('id' => $id);
        }
        $todoArray = $todoObject->read($where);
        $dataTransfer->data($todoArray);
        $this->response($dataTransfer->getAllData());
    }

    public function index_post(){
        $dataTransfer = new Data_Transfer();

        $inputData = new SmartyParams($this->_post_args);

        if(empty($inputData['name'])){
            $dataTransfer->error()->field('name', 'required');
        } else {
            $data = array();
            $data['name'] = trim($inputData['name']);
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
            $data['link'] = md5(gettimeofday(true).rand(1,1100)).gettimeofday(true);

            $todoObject = new Todo_model();
            $todoId = $todoObject->create($data);

            $this->index_get($todoId);
            return;

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
        $dataTransfer->data($todoItemArray);
        $this->response($dataTransfer->getAllData());
    }

    public function item_post($todoId = null){

        $inputData = new SmartyParams($this->_post_args);

        $dataTransfer = new Data_Transfer();
        if(is_null($todoId)){
            $dataTransfer->error()->field('todo_id', 'requared');
        }
        if(empty($inputData['name'])){
            $dataTransfer->error()->field('name', 'required');
        }

        if (!$dataTransfer->hasError()){
            $data = array();
            $data['todo_id'] = trim($todoId);
            $data['name'] = trim($inputData['name']);
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));

            $todoItemObject = new TodoItem_model();
            $todoItemId = $todoItemObject->create($data);

            $this->item_get($todoId, $todoItemId);
            return;

        }
        $this->response($dataTransfer->getAllData());
    }

    public function index_put($id = null){
        $dataTransfer = new Data_Transfer();

        $inputData = new SmartyParams($this->_args);

        if(!empty($inputData['name'])){
//            $dataTransfer->error()->field('name', 'required');
//        } else {
            $data = array();
            $data['name'] = trim($inputData['name']);
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
            $data['link'] = md5(gettimeofday(true).rand(1,1100)).gettimeofday(true);

            $todoObject = new Todo_model();
            $todoId = $todoObject->update($data, array('id' => $id));

            $this->index_get($todoId);
            return;

        }
        $this->response($dataTransfer->getAllData());
    }


    public function item_put($todoId = null){

        $inputData = new SmartyParams($this->_args);

        $dataTransfer = new Data_Transfer();
        if(is_null($todoId)){
            $dataTransfer->error()->field('todo_id', 'required');
        }
        if(empty($inputData['name'])){
            $dataTransfer->error()->field('name', 'required');
        }

        if (!$dataTransfer->hasError()){
            $data = array();
            $data['todo_id'] = trim($todoId);
            $data['name'] = trim($inputData['name']);
            $data['is_active'] = trim($inputData['is_active']);
            $data['sort_order'] = trim($inputData['sort_order']);
            $data['name'] = trim($inputData['name']);
            $data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));

            $todoItemObject = new TodoItem_model();
            $todoItemId = $todoItemObject->update($data, array('id' => $todoId));

            $this->item_get($todoId, $todoItemId);
            return;

        }
        $this->response($dataTransfer->getAllData());
    }


    public function index_delete($id){
        $dataTransfer = new Data_Transfer();
        $todoObject = new Todo_model();
        $todoResult = $todoObject->delete(array('id' => $id));
        $dataTransfer->data('result', $todoResult);
        $this->response($dataTransfer->getAllData());
    }

    public function item_delete($todoId, $id){
        $dataTransfer = new Data_Transfer();
        $todoObject = new TodoItem_model();
        $todoResult = $todoObject->delete(array('id' => $id));
        $dataTransfer->data('result', $todoResult);
        $this->response($dataTransfer->getAllData());
    }

}