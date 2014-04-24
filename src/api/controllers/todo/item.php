<?php



class TodoItemController extends BaseController {

	/**@var TodoItemModel */
	public $model;


	public function __construct () {
		parent::__construct();
		$this->model = TodoItemModel::instance();
	}


	public function GET_MANY ($listId) {
		return $this->model->read(array("todo_id" => $listId));
	}


	public function GET_ONE ($listId, $itemId) {
		return  $this->model->read($itemId);
	}


	// CREATE ITEM
	public function CREATE_ONE ($todoId) {
		$data = array(
			"todo_id" => $todoId,
			"date_create" => date("Y-m-d H:i:s", gettimeofday(true))
		);

		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);

		$itemId = $this->model->create($data);

		return $this->GET_ONE($todoId, $itemId);
	}


	// UPDATE ITEM
	public function UPDATE_ONE ($todoId, $id) {
		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);
		$this->model->update($data, $id);

		return $this->GET_ONE($todoId, $id);
	}


	// DELETE ITEM
	public function DELETE_ONE ($todoId, $id) {
		$result = $this->model->delete($id);

		return array("status" => $result);
	}
}