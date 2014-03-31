<?php



class Todo extends ApiController {

	/** @var TodoModel */
	public $todoList;

	/**@var TodoItemModel */
	public $todoItem;


	public function __construct () {
		parent::__construct();
		$this->todoList = TodoModel::instance();
		$this->todoItem = TodoItemModel::instance();
	}


	// READ ALL LISTS
	private function _getAllLists () {
		return $this->todoList->read(array("user_id" => $this->user->current("id")));
	}


	// READ ONE LIST
	private function _getOneList ($listId) {
		return $this->todoList->read(array("id" => $listId, "user_id" => $this->user->current("id")));
	}


	// READ LIST
	public function GET_list ($id = null) {
		if (is_null($id)) {
			return $this->_getAllLists();
		}

		return $this->_getOneList($id);
	}


	// CREATE LIST
	public function POST_list () {
		$data = $this->api->input->pick('name', 'is_shared', 'sort_order');
		$data['user_id'] = $this->user->current("id");
		$data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
		$data['link'] = rand(1, 1100).gettimeofday(true).rand(1, 1100);
		$listId = $this->todoList->create($data);

		return $this->_getOneList($listId);
	}


	// UPDATE LIST
	public function PUT_list ($listId) {
		$data = $this->api->input->pick('name', 'is_shared', 'sort_order');
		$this->todoList->update($data, array("id" => $listId, 'user_id' => $this->user->current("id")));

		return $this->_getOneList($listId);
	}


	// DELETE LIST
	public function DELETE_list ($id) {
		$todoResult = $this->todoList->delete(array("id" => $id, 'user_id' => $this->user->current("id")));

		return array("status" => $todoResult);
	}




	// ITEMS

	// GET ONE ITEM
	private function _getOneTodoListItem ($listId, $itemId) {
		return $this->todoItem->read($itemId);
	}


	// GET ALL ITEMS
	private function _getAllTodoListItem ($listId) {
		return $this->todoItem->read(array("todo_id" => $listId));
	}


	// READ ITEM
	public function GET_item ($todoId, $id = null) {
		if (is_null($id)) {
			return $this->_getAllTodoListItem($todoId);
		} else {
			return $this->_getOneTodoListItem($todoId, $id);
		}
	}


	// CREATE ITEM
	public function POST_item ($todoId) {
		$data = array("todo_id" => $todoId, "date_create" => date("Y-m-d H:i:s", gettimeofday(true)));

		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);

		$itemId = $this->todoItem->create($data);

		return $this->_getOneTodoListItem($todoId, $itemId);
	}


	// UPDATE ITEM
	public function PUT_item ($todoId, $id) {
		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);
		$this->todoItem->update($data, $id);

		return $this->_getOneTodoListItem($todoId, $id);
	}


	// DELETE ITEM
	public function DELETE_item ($todoId, $id) {
		$result = $this->todoItem->delete($id);

		return array("status" => $result);
	}
}