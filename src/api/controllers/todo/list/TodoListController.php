<?php



class TodoListController extends BaseResourceController {

	/** @var TodoModel */
	public $model;


	public function init () {
		parent::init();
		$this->model = TodoModel::instance();
	}


	public function getMany () {
		return $this->model->read(array("user_id" => $this->user->current("id")));
	}


	public function getOne ($listId) {
		return $this->model->read(array("id" => $listId, "user_id" => $this->user->current("id")));
	}


	// CREATE LIST
	public function createOne () {
		$data = $this->request->pick('name', 'is_shared', 'sort_order');
		$data['user_id'] = $this->user->current("id");
		$data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
		$data['link'] = rand(1, 1100).gettimeofday(true).rand(1, 1100);
		$listId = $this->model->create($data);

		return $this->getOne($listId);
	}


	// UPDATE LIST
	public function updateOne ($listId) {
		$data = $this->request->pick('name', 'is_shared', 'sort_order');
		$this->model->update($data, array("id" => $listId, 'user_id' => $this->user->current("id")));

		return $this->getOne($listId);
	}


	// DELETE LIST
	public function deleteOne ($id) {
		$todoResult = $this->model->delete(array("id" => $id, 'user_id' => $this->user->current("id")));

		return array("status" => $todoResult);
	}
}