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
        $this->load->model('Todo_model', "todoList");
        $this->load->model('TodoItem_model', "todoItem");
    }

    private function _getAllLists(){
        $todoArray = $this->todoList->read();
        $this->transfer($todoArray);
    }

    private function _getOneList($listId){
        $todoArray = $this->todoList->read(array(
            'id' => $listId
        ));
        $this->transfer($todoArray);
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
        $listId = $this->todoList->create($data);
        $this->_getOneList($listId);
    }

    public function list_put($listId){
        $inputData = new SmartyParams($this->_input());
        $inputData->map("trim");

        $data = array();
        $data['name']           = $inputData->get('name', "");
        $data['is_shared']      = $inputData->get('is_shared', 0);
        $data['sort_order']     = $inputData->get('sort_order', 0);

        $this->todoList->update($data, array(
            'id' => $listId
        ));

        $this->_getOneList($listId);
    }

    public function list_delete($id){
        $todoResult = $this->todoList->delete(array(
            'id' => $id
        ));
        $this->transfer('status', $todoResult);
    }

    // ITEMS

    private function _getOneTodoListItem($listId, $itemId){
        $todoItemArray = $this->todoItem->read(array(
            "id" => $itemId,
            "todo_id" => $listId
        ));
        $this->transfer($todoItemArray);
    }

    private function _getAllTodoListItem($listId){
        $todoItemArray = $this->todoItem->read(array(
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

        // CREATE ITEM
        if (!$this->transfer()->hasError()){
            $data = array(
                "todo_id" => $inputData["todo_id"],
                "name" => $inputData->get('name', ""),
                "date_create" => date("Y-m-d H:i:s", gettimeofday(true))
            );
            $itemId = $this->todoItem->create($data);
            $this->_getOneTodoListItem($todoId, $itemId);
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
            $this->todoItem->update($data, array(
                'id' => $id
            ));

            $this->_getOneTodoListItem($todoId, $id);
        }
    }

    public function item_delete($todoId, $id){
        $todoResult = $this->todoItem->delete(array(
            'id' => $id,
            "todo_id" => $todoId
        ));
        $this->transfer('status', $todoResult);
    }

}