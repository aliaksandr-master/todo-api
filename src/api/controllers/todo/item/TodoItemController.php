<?php



class TodoItemController extends BaseResourceController {

	/**@var TodoItemModel */
	public $model;


	public function init () {
		parent::init();
		$this->model = TodoItemModel::instance();
	}


	public function getMany ($listId) {
		return $this->model->read(array("todo_id" => $listId));
	}


	public function getOne ($listId, $itemId) {
		return  $this->model->read($itemId);
	}


	// CREATE ITEM
	public function createOne ($todoId) {
		$data = array(
			"todo_id" => $todoId,
			"date_create" => date("Y-m-d H:i:s", gettimeofday(true))
		);

		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);

		$itemId = $this->model->create($data);

		return $this->getOne($todoId, $itemId);
	}


	// UPDATE ITEM
	public function updateOne ($todoId, $id) {
		$data['name'] = $this->input('name', "");
		$data['is_active'] = $this->input('is_active', 0);
		$data['sort_order'] = $this->input('sort_order', 0);
		$this->model->update($data, $id);

		return $this->getOne($todoId, $id);
	}


	// DELETE ITEM
	public function deleteOne ($todoId, $id) {
		$result = $this->model->delete($id);

		return array("status" => $result);
	}
}