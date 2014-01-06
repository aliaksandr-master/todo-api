<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require(APPPATH.'/libraries/REST_Controller.php');
require(APPPATH.'/libraries/SmartyParams.php');
require(APPPATH.'/libraries/data_transfer/DataTransfer.php');

class Todo extends REST_Controller {

    /**
     * @var DataTransfer
     */
    private $_dataTransfer;
    private $_userId;

    public function __construct() {

        parent::__construct();
        $this->_dataTransfer = new DataTransfer($this);

        $this->_userId = isset($_SESSION["user_id"]) ? $_SESSION["user_id"] : null;

        $this->loader()->model('Todo_model');
        $this->loader()->model('TodoItem_model');
    }

    private function _getAllLists(){
        $todoModel = new Todo_model();
        $todoArray = $todoModel->read();
        $this->_dataTransfer->data($todoArray);

        $this->_dataTransfer->sendRestControllerResponse();
    }

    private function _getOneList($listId){
        $todoObject = new Todo_model();

        $todoArray = $todoObject->read(array(
            'id' => $listId
        ));

        if($todoArray){
            $this->_dataTransfer->data($todoArray[0]);
        }else{
            $this->_dataTransfer->code(404);
        }
        $this->_dataTransfer->sendRestControllerResponse();
    }

    public function list_get($id = null){
        if (is_null($id)) {
            $this->_getAllLists();
        } else {
            $this->_getOneList($id);
        }
    }

    public function list_post(){

        $inputData = new SmartyParams($this->args());
        $inputData->map("trim");

        $data = array();
        $data['name']           = $inputData['name'];
        $data['date_create']    = date("Y-m-d H:i:s", gettimeofday(true));
        $data['link']           = md5(gettimeofday(true).rand(1,1100)).gettimeofday(true);

        $todoModel = new Todo_model();
        $listId = $todoModel->create($data);

        $this->_getOneList($listId);
    }

    public function list_put($listId){
        $inputData = new SmartyParams($this->args());
        $inputData->map("trim");

        $data = array();
        $data['name'] = $inputData['name'];

        $todoModel = new Todo_model();
        $todoModel->update($data, array(
            'id' => $listId
        ));

        $this->_getOneList($listId);
    }

    public function list_delete($id){
        $todoObject = new Todo_model();

        $todoResult = $todoObject->delete(array(
            'id' => $id
        ));

        $this->_dataTransfer->data('result', $todoResult);
        $this->_dataTransfer->sendRestControllerResponse();
    }

    // ITEMS

    private function _getOneTodoListItem($listId, $itemId){
        $todoItemModel = new TodoItem_model();

        $todoItemArray = $todoItemModel->read(array(
            "id" => $itemId,
            "todo_id" => $listId
        ));

        if($todoItemArray){
            $this->_dataTransfer->data($todoItemArray[0]);
        }else{
            $this->_dataTransfer->code(404);
        }
        $this->_dataTransfer->sendRestControllerResponse();

    }

    private function _getAllTodoListItem($listId){
        $todoItemModel = new TodoItem_model();

        $todoItemArray = $todoItemModel->read(array(
            "todo_id" => $listId
        ));

        $this->_dataTransfer->data($todoItemArray);
        $this->_dataTransfer->sendRestControllerResponse();
    }

    public function item_get($todoId, $id = null){
        if (is_null($id)) {
            $this->_getAllTodoListItem($todoId);
        }else{
            $this->_getOneTodoListItem($todoId, $id);
        }
    }

    public function item_post($todoId){

        $inputData = new SmartyParams($this->args());
        $inputData->set("todo_id", $todoId);
        $inputData->map("trim");

        // VALIDATION
        if(empty($todoId)){
            $this->_dataTransfer->error()->field('todo_id', 'required');
        }

        // CREATE ITEM
        if (!$this->_dataTransfer->hasError()){

            $data = array(
                "todo_id" => $inputData["todo_id"],
                "name" => $inputData->get('name', ""),
                "date_create" => date("Y-m-d H:i:s", gettimeofday(true))
            );

            $todoItemModel = new TodoItem_model();
            $itemId = $todoItemModel->create($data);

            $this->_getOneTodoListItem($todoId, $itemId);
            return;
        }
        $this->_dataTransfer->sendRestControllerResponse();
    }

    public function item_put($todoId, $id){

        $inputData = new SmartyParams($this->args());
        $inputData->map("trim");

        if(empty($todoId)){
            $this->_dataTransfer->error()->field('todo_id', 'required');
        }

        if(empty($id)){
            $this->_dataTransfer->error()->field('id', 'required');
        }

        if (!$this->_dataTransfer->hasError()){
            $data = array();

            $data['name']           = $inputData['name'];
            $data['is_active']      = $inputData['is_active'];
            $data['sort_order']     = $inputData['sort_order'];

            $todoItemModel = new TodoItem_model();
            $todoItemModel->update($data, array(
                'id' => $id
            ));

            $this->_getOneTodoListItem($todoId, $id);
            return;
        }
        $this->_dataTransfer->sendRestControllerResponse();
    }



    public function item_delete($todoId, $id){
        $todoModel = new TodoItem_model();
        $todoResult = $todoModel->delete(array(
            'id' => $id,
            "todo_id" => $todoId
        ));
        $this->_dataTransfer->data('result', $todoResult);
        $this->_dataTransfer->sendRestControllerResponse();
    }

}