<?php



class User extends BaseController {

	public function __construct () {
		parent::__construct();
		$this->load->library('email');
		$this->load->helper('email');
		$this->load->helper('url');
	}

	public function GET_ONE ($userId) {
		return $this->user->read($userId);
	}

	public function GET_MANY () {
		return $this->user->read();
	}

	public function UPDATE_ONE ($id) {
		$data = $this->api->input->pipe($this->user->safeFieldsMap());
		if ($this->input('password_new')) {
			$data['password'] = $this->input('password_new');
		}
		$this->user->update($data, $id);

		return $this->GET_ONE($id);
	}


	public function DELETE_ONE ($id) {
		$user = $this->user->read($id);
		if (empty($user)) {
			$this->api->output->error(404);
		} else {
			$this->user->delete($id);
		}

		return array("status" => !empty($user));
	}


	public function CREATE_ONE () {
		$data = $this->api->input->pipe($this->user->safeFieldsMap());
		$data['password'] = $this->user->cryptPassword($data['password']);
		$data['date_register'] = date("Y-m-d H:i:s", gettimeofday(true));
		$activationCode = sha1(md5(microtime()));
		$data['activation_code'] = $activationCode;
		$userId = $this->user->create($data);

		return $this->GET_ONE($userId);
	}

	public function _rule__valid_password ($value, array $params = array(), $name = null) {
		$id = $this->input("id");
		$data = $this->user->read(array('password' => $this->user->cryptPassword($value), 'id' => $id));

		return !empty($data);
	}


	public function _rule__exists ($value, array $params = array(), $name = null) {
		$data = $this->user->read(array($name => $value));

		return !empty($data);
	}


	public function _rule__unique ($value, array $params = array(), $name = null) {
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