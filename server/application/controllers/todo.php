<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

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


    // READ ALL LISTS
    private function _getAllLists(){
        $todoArray = $this->todoList->read();
        $this->transfer($todoArray);
    }


    // READ ONE LIST
    private function _getOneList($listId){
        $todoArray = $this->todoList->read($listId);
        $this->transfer($todoArray);
    }


    // READ LIST
    public function list_get($id = null){
        if (is_null($id)) {
            $this->_getAllLists();
        } else {
            $this->_getOneList($id);
        }
    }


    // CREATE LIST
    public function list_post(){
        $data['name']           = $this->api()->input('name', "");
        $data['is_shared']      = $this->api()->input('is_shared', 0);
        $data['sort_order']     = $this->api()->input('sort_order', 0);
        $data['date_create']    = date("Y-m-d H:i:s", gettimeofday(true));
        $data['link']           = md5(gettimeofday(true).rand(1, 1100)).gettimeofday(true);
        $listId = $this->todoList->create($data);
        $this->_getOneList($listId);
    }


    // UPDATE LIST
    public function list_put($listId){
        $data['name']           = $this->api()->input('name', "");
        $data['is_shared']      = $this->api()->input('is_shared', 0);
        $data['sort_order']     = $this->api()->input('sort_order', 0);
        $this->todoList->update($data, $listId);
        $this->_getOneList($listId);
    }


    // DELETE LIST
    public function list_delete($id){
        $todoResult = $this->todoList->delete($id);
        $this->transfer('status', $todoResult);
    }




    // ITEMS


    // GET ONE ITEM
    private function _getOneTodoListItem($listId, $itemId){
        $todoItemArray = $this->todoItem->read($itemId);
        $this->transfer($todoItemArray);
    }


    // GET ALL ITEMS
    private function _getAllTodoListItem($listId){
        $todoItemArray = $this->todoItem->read(array(
            "todo_id" => $listId
        ));
        $this->transfer($todoItemArray);
    }


    // READ ITEM
    public function item_get($todoId, $id = null){
        if (is_null($id)) {
            $this->_getAllTodoListItem($todoId);
        }else{
            $this->_getOneTodoListItem($todoId, $id);
        }
    }


    // CREATE ITEM
    public function item_post($todoId){
        $data = array(
            "todo_id" => $todoId,
            "name" => $this->api()->input('name', ""),
            "date_create" => date("Y-m-d H:i:s", gettimeofday(true))
        );
        $itemId = $this->todoItem->create($data);
        $this->_getOneTodoListItem($todoId, $itemId);
    }


    // UPDATE ITEM
    public function item_put($todoId, $id){
        $data['name']       = $this->api()->input('name', "");
        $data['is_active']  = $this->api()->input('is_active', 0);
        $data['sort_order'] = $this->api()->input('sort_order', 0);
        $this->todoItem->update($data, $id);

        $this->_getOneTodoListItem($todoId, $id);
    }


    // DELETE ITEM
    public function item_delete($todoId, $id){
        $todoResult = $this->todoItem->delete($id);
        $this->transfer('status', $todoResult);
    }

}