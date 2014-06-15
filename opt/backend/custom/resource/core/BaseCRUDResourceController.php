<?php

class BaseCRUDResourceController extends BaseResourceController {

	function accessOnlyOwner () {
		$attr = !empty($this->onlyOwnerMethodMap[$this->request->action()]) ? $this->onlyOwnerMethodMap[$this->request->action()] : null;
		$specAccess = $this->request->spec('access');
		if (!$attr && !empty($specAccess['only_owner'])) {
			$attr = $specAccess['only_owner'];
		}
		if ($attr) {
			if (!is_string($attr)) {
				$attr = $this->onlyOwnerAttr;
			}
		}
		return $attr;
	}

	protected $onlyOwnerAttr = 'user_id';

	protected $onlyOwnerMethodMap = array();

	function getOne ($id) {
		$promoter = &$this->model->promoter('get');

		$onlyOwnerAttr = $this->accessOnlyOwner();
		if ($onlyOwnerAttr) {
			$promoter->where($onlyOwnerAttr, $this->user->current("id"));
		}

		return $promoter->byId($id)->limit(1, 0);
	}

	function getMany () {
		$promoter = &$this->model->promoter('get');

		$onlyOwnerAttr = $this->accessOnlyOwner();
		if ($onlyOwnerAttr) {
			$promoter->where($onlyOwnerAttr, $this->user->current("id"));
		}

		return $promoter->limit($this->request->dataLimit(), $this->request->dataOffset());
	}

	function createOne () {
		$promoter = &$this->model->promoter('create');

		$onlyOwnerAttr = $this->accessOnlyOwner();
		if ($onlyOwnerAttr) {
			$promoter->set($onlyOwnerAttr, $this->user->current("id"));
		}

		return $promoter->set($this->prepareInputData($this->request->body()));
	}

	function updateOne ($id) {
		$promoter = &$this->model->promoter('update');

		$onlyOwnerAttr = $this->accessOnlyOwner();
		if ($onlyOwnerAttr) {
			$promoter->set($onlyOwnerAttr, $this->user->current("id"));
		}

		return $promoter->set($this->prepareInputData($this->request->body()))->byId($id);
	}

	function deleteOne ($id) {
		$promoter = &$this->model->promoter('delete');

		$onlyOwnerAttr = $this->accessOnlyOwner();
		if ($onlyOwnerAttr) {
			$promoter->where($onlyOwnerAttr, $this->user->current("id"));
		}

		return $promoter->byId($id);
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
		} /*else if ($this->request->action() === 'getMany') {
			if (!$result) {
				$this->response->status(404);
				return null;
			}
		}*/
		return $result;
	}

}