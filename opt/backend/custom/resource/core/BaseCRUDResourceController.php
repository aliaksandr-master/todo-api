<?php

class BaseCRUDResourceController extends BaseResourceController {

	function getOne ($id) {
		return $this->model->promoter('get')->byId($id)->limit(1, 0);
	}

	function getMany () {
		return $this->model->promoter('get')->limit($this->request->dataLimit(), $this->request->dataOffset());
	}

	function createOne () {
		return $this->model->promoter('create')->set($this->prepareInputData($this->request->body()));
	}

	function updateOne ($id) {
		return $this->model->promoter('update')->set($this->prepareInputData($this->request->body()))->byId($id);
	}

	function deleteOne ($id) {
		return $this->model->promoter('delete')->byId($id);
	}

	function prepareInputData ($data) {
		return $data;
	}

	function prepareResult ($result) {
		if ($this->request->action() === 'deleteOne') {
			if ($result) {
				$this->response->status(200);
			} else {
				$this->response->status(410);
			}
			return null;
		} else if ($this->request->action() === 'updateOne') {
			if (!$result) {
				$this->response->status(410);
				return null;
			}
		} else if ($this->request->action() === 'createOne') {
			if (!$result) {
				$this->response->fatalError('result undefined');
				return null;
			}
		} else if ($this->request->action() === 'getOne') {
			if (!$result) {
				$this->response->status(404);
				return null;
			}
		} else if ($this->request->action() === 'getMany') {
			if (!$result) {
				$this->response->status(404);
				return null;
			}
		}
		return $result;
	}

}