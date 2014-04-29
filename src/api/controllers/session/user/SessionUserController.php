<?php



class SessionUserController extends BaseController {

	public function DELETE_ONE_user () {
		$id = $this->user->current('id');
		$this->user->logout();

		return array('status' => (bool) $id);
	}


	public function CREATE_ONE_user () {
		$password = $this->user->cryptPassword($this->input('password'));

		$user = $this->user->read(array('username' => $this->input("username"), 'password' => $password));

		if (empty($user[0])) {
			$user = $this->user->read(array('email' => $this->input("username"), 'password' => $password));
		}

		if (empty($user[0])) {
			$this->api->validation->ruleError('username', 'login_incorrect');
			$this->api->validation->ruleError('password', 'login_incorrect');

			return null;
		} else {
			$this->user->login($user[0]);
		}

		return $user[0];
	}


	public function GET_ONE_user () {
		$user = $this->user->current();
		if (empty($user)) {
			$this->api->output->error(null, 404);
		}

		return $user;
	}
}