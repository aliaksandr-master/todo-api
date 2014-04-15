<?php



class Todo_List extends BaseController {

	/** @var TodoModel */
	public $model;


	public function __construct () {
		parent::__construct();
		$this->model = TodoModel::instance();
	}


	public function GET_MANY () {
		return $this->model->read(array("user_id" => $this->user->current("id")));
	}


	public function GET_ONE ($listId) {
		return $this->model->read(array("id" => $listId, "user_id" => $this->user->current("id")));
	}


	// CREATE LIST
	public function CREATE_ONE () {
		$data = $this->api->input->pick('name', 'is_shared', 'sort_order');
		$data['user_id'] = $this->user->current("id");
		$data['date_create'] = date("Y-m-d H:i:s", gettimeofday(true));
		$data['link'] = rand(1, 1100).gettimeofday(true).rand(1, 1100);
		$listId = $this->model->create($data);

		return $this->GET_ONE($listId);
	}


	// UPDATE LIST
	public function UPDATE_ONE ($listId) {
		$data = $this->api->input->pick('name', 'is_shared', 'sort_order');
		$this->model->update($data, array("id" => $listId, 'user_id' => $this->user->current("id")));

		return $this->GET_ONE($listId);
	}


	// DELETE LIST
	public function DELETE_ONE ($id) {
		$todoResult = $this->model->delete(array("id" => $id, 'user_id' => $this->user->current("id")));

		return array("status" => $todoResult);
	}
}