<?php



class CrmUserController extends CrmBaseController {

	public function getOne ($userId) {
		return $this->user->read($userId);
	}

	public function getMany () {
		return $this->user->read();
	}

	public function updateOne ($id) {
		$data = $this->request->pipe($this->user->safeFieldsMap());
		if ($this->input('password_new')) {
			$data['password'] = $this->input('password_new');
		}
		$this->user->update($data, $id);

		return $this->getOne($id);
	}


	public function deleteOne ($id) {
		$user = $this->user->read($id);
		if (empty($user)) {
			$this->request->contentError(null, 404);
		} else {
			$this->user->delete($id);
		}

		return array("status" => !empty($user));
	}


	public function createOne () {
		$data = $this->request->pipe($this->user->safeFieldsMap());
		$data['password'] = $this->user->cryptPassword($data['password']);
		$data['date_register'] = date("Y-m-d H:i:s", gettimeofday(true));
		$activationCode = sha1(md5(microtime()));
		$data['activation_code'] = $activationCode;
		$userId = $this->user->create($data);

		return $this->getOne($userId);
	}

	public function rule_valid_password ($value, array $params = array(), $name = null) {
		$id = $this->input("id");
		$data = $this->user->read(array('password' => $this->user->cryptPassword($value), 'id' => $id));

		return !empty($data);
	}


	public function rule_exists ($value, array $params = array(), $name = null) {
		$data = $this->user->read(array($name => $value));

		return !empty($data);
	}


	public function rule_unique ($value, array $params = array(), $name = null) {
		$data = $this->user->read(array($name => $value));
		if (empty($data)) {
			return true;
		}
		$id = $this->input("id");
		if (!$id) {
			return false;
		}
		if (count($data) == 1 && $data[0]['id'] == $id) {
			return true;
		}

		return false;
	}
}