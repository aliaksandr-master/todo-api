<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'/libraries/SmartyParams.php');
require_once(APPPATH.'/core/API_Controller.php');

class Todo extends API_Controller {

    /**
     * @var Todo_model
     */
    public $todoList;

    /**
     * @var TodoItem_model
     */
    public $todoItem;

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Todo_model', "todoList");
        $this->loader()->model('TodoItem_model', "todoItem");
    }

    private function _getAllLists(){
        $todoArray = $this->todoList->read();
        $this->transfer($todoArray);
    }

    private function _getOneList($listId){
        $todoArray = $this->todoList->read(array(
            'id' => $listId
        ));

        if($todoArray){
            $this->transfer($todoArray[0]);
        }else{
            $this->transfer()->code(404);
        }
    }

    public function list_get($id = null){
        if (is_null($id)) {
            $this->_getAllLists();
        } else {
            $this->_getOneList($id);
        }
    }

    public function list_post(){

        $inputData = new SmartyParams($this->_input());
        $inputData->map("trim");

        $data = array();
        $data['name']           = $inputData->get('name', 0);
        $data['is_shared']      = $inputData->get('is_shared', 0);
        $data['sort_order']     = $inputData->get('sort_order', 0);
        $data['date_create']    = date("Y-m-d H:i:s", gettimeofday(true));
        $data['link']           = md5(gettimeofday(true).rand(1,1100)).gettimeofday(true);

        $todoModel = new Todo_model();
        $listId = $todoModel->create($data);

        $this->_getOneList($listId);
    }

    public function list_put($listId){
        $inputData = new SmartyParams($this->_input());
        $inputData->map("trim");

        $data = array();
        $data['name']           = $inputData->get('name', "");
        $data['is_shared']      = $inputData->get('is_shared', 0);
        $data['sort_order']     = $inputData->get('sort_order', 0);

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

        $this->transfer('result', $todoResult);
    }

    // ITEMS

    private function _getOneTodoListItem($listId, $itemId){
        $todoItemModel = new TodoItem_model();

        $todoItemArray = $todoItemModel->read(array(
            "id" => $itemId,
            "todo_id" => $listId
        ));

        if($todoItemArray){
            $this->transfer($todoItemArray[0]);
        }else{
            $this->transfer()->code(404);
        }

    }

    private function _getAllTodoListItem($listId){
        $todoItemModel = new TodoItem_model();

        $todoItemArray = $todoItemModel->read(array(
            "todo_id" => $listId
        ));

        $this->transfer($todoItemArray);
    }

    public function item_get($todoId, $id = null){
        if (is_null($id)) {
            $this->_getAllTodoListItem($todoId);
        }else{
            $this->_getOneTodoListItem($todoId, $id);
        }
    }

    public function item_post($todoId){

        $inputData = new SmartyParams($this->_input());
        $inputData->set("todo_id", $todoId);
        $inputData->map("trim");

        // VALIDATION
        if(empty($todoId)){
            $this->transfer()->error()->field('todo_id', 'required');
        }

        // CREATE ITEM
        if (!$this->transfer()->hasError()){

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
    }

    public function item_put($todoId, $id){

        $inputData = new SmartyParams($this->_input());
        $inputData->map("trim");

        if(empty($todoId)){
            $this->transfer()->error()->field('todo_id', 'required');
        }

        if(empty($id)){
            $this->transfer()->error()->field('id', 'required');
        }

        if (!$this->transfer()->hasError()){
            $data = array();

            $data['name']           = $inputData->get('name', "");
            $data['is_active']      = $inputData->get('is_active', 0);
            $data['sort_order']     = $inputData->get('sort_order', 0);

            $todoItemModel = new TodoItem_model();
            $todoItemModel->update($data, array(
                'id' => $id
            ));

            $this->_getOneTodoListItem($todoId, $id);
        }
    }

    public function item_delete($todoId, $id){
        $todoModel = new TodoItem_model();
        $todoResult = $todoModel->delete(array(
            'id' => $id,
            "todo_id" => $todoId
        ));
        $this->transfer('result', $todoResult);
    }

}