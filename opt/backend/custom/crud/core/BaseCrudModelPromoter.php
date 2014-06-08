<?php

class BaseCrudModelPromoter {

	private $model;

	private $limit;

	private $offset;

	private $where = array();

	private $data = array();

	private $mode;

	function __construct(BaseCrudModel &$model, $mode) {
		if (!method_exists($this, $mode.'Flow')) {
			trigger_error('Invalid mode type "'.$mode.'"', E_USER_ERROR);
		}
		$this->mode = $mode;
		$this->model = $model;
	}

	function limit ($limit, $offset = null) {
		$this->limit = $limit;
		if (!is_null($offset)) {
			$this->offset = $offset;
		}
		return $this;
	}

	function where ($set, $value = null, $operator = '=') {
		if (is_array($set)) {
			foreach ($set as $k => $v) {
				$this->where[$k] = $v;
			}
		} else {
			$this->where[$set.' '.$operator] = $value;
		}
		return $this;
	}

	private function getFlow () {
		$options = array();
		if ($this->limit) {
			$options['limit'] = $this->limit;
			if ($this->offset) {
				$options['offset'] = $this->offset;
			}
		}
		return $this->model->read($this->where, $options);
	}

	function byId ($id) {
		if (!is_integer($id)) {
			trigger_error('id "'. $id .'" must be integer!!!', E_USER_ERROR);
		}
		$this->where($this->model->idAttribute(), $id);
		return $this;
	}

	function set ($set = null, $value = null) {
		if (!is_array($set)) {
			$set = array(
				$set => $value
			);
		}
		foreach ($set as $key => $value) {
			if (method_exists($this->model, 'prepare_'.$key)) {
				$value = $this->model->{'prepare_'.$key}($value);
			}
			$this->data[$key] = $value;
		}
		return $this;
	}

	function result () {
		return $this->{$this->mode.'Flow'}();
	}

	function getTotal () {
		return $this->model->count($this->where);
	}

	function deleteFlow () {
		if (empty($this->where)) {
			return null;
		}
		$res = $this->model->promoter('get')->where($this->where)->limit(1, 0)->result();
		if (empty($res)) {
			return null;
		}
		$this->model->delete($this->where);
		return true;
	}

	private function createFlow () {
		$id = $this->model->create($this->data);
		return $this->model->promoter('get')->byId($id)->limit(1, 0)->result();
	}

	private function insertFlow () {
		if (empty($this->where)) {
			return null;
		}
		$res = $this->model->promoter('get')->where($this->where)->limit(1, 0)->result();
		if (!empty($res)) {
			return null;
		}
		$this->model->update($this->data, $this->where);
		return $this->model->promoter('get')->where($this->where)->limit(1, 0)->result();
	}

	private function updateFlow () {
		if (empty($this->where)) {
			return null;
		}
		$res = $this->model->promoter('get')->where($this->where)->limit(1, 0)->result();
		if (empty($res)) {
			return null;
		}
		$id = $this->model->update($this->data, $this->where);
		if ($id) {
			return array_merge($res[0], $this->data);
		}
		return null;
	}

	private function editFlow () {
		if (empty($this->where)) {
			return null;
		}
		$id = $this->model->update($this->data, $this->where);
		return $this->model->promoter('get')->byId($id)->limit(1, 0)->result();
	}

}