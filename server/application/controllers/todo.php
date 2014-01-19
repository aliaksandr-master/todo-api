<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Todo extends ApiController {

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
        return $this->todoList->read(array(
            "user_id" => $this->user->current("id")
        ));
    }


    // READ ONE LIST
    private function _getOneList($listId){
        return $this->todoList->read($listId);
    }


    // READ LIST
    public function list_get($id = null){
        if (is_null($id)) {
            return $this->_getAllLists();
        }
        return $this->_getOneList($id);
    }


    // CREATE LIST
    public function list_post(){
        $data['user_id']        = $this->user->current("id");
        $data['name']           = $this->api()->input('name', "");
        $data['is_shared']      = $this->api()->input('is_shared', 0);
        $data['sort_order']     = $this->api()->input('sort_order', 0);
        $data['date_create']    = date("Y-m-d H:i:s", gettimeofday(true));
        $data['link']           = md5(gettimeofday(true).rand(1, 1100)).gettimeofday(true);
        $listId = $this->todoList->create($data);
        return $this->_getOneList($listId);
    }


    // UPDATE LIST
    public function list_put($listId){
        $data['name']           = $this->api()->input('name', "");
        $data['is_shared']      = $this->api()->input('is_shared', 0);
        $data['sort_order']     = $this->api()->input('sort_order', 0);
        $this->todoList->update($data, array(
            "id" => $listId,
            'user_id' => $this->user->current("id")
        ));
        return $this->_getOneList($listId);
    }


    // DELETE LIST
    public function list_delete($id){
        $todoResult = $this->todoList->delete(array(
            "id" => $id,
            'user_id'=> $this->user->current("id")
        ));
        return array("status" => $todoResult);
    }




    // ITEMS


    // GET ONE ITEM
    private function _getOneTodoListItem($listId, $itemId){
        return $this->todoItem->read($itemId);
    }


    // GET ALL ITEMS
    private function _getAllTodoListItem($listId){
        return $this->todoItem->read(array(
            "todo_id" => $listId
        ));
    }


    // READ ITEM
    public function item_get($todoId, $id = null){
        if (is_null($id)) {
            return $this->_getAllTodoListItem($todoId);
        } else {
            return $this->_getOneTodoListItem($todoId, $id);
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
        return $this->_getOneTodoListItem($todoId, $itemId);
    }


    // UPDATE ITEM
    public function item_put($todoId, $id){
        $data['name']       = $this->api()->input('name', "");
        $data['is_active']  = $this->api()->input('is_active', 0);
        $data['sort_order'] = $this->api()->input('sort_order', 0);
        $this->todoItem->update($data, $id);

        return $this->_getOneTodoListItem($todoId, $id);
    }


    // DELETE ITEM
    public function item_delete($todoId, $id){
        $result = $this->todoItem->delete($id);
        return array("status" => $result);
    }

}