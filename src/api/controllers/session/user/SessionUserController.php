<?php



class SessionUserController extends BaseResourceController {

	public function deleteOne () {
		$id = $this->user->current('id');
		$this->user->logout();

		return array('status' => (bool) $id);
	}


	public function createOne () {
		$password = $this->user->cryptPassword($this->input('password'));

		$user = $this->user->read(array('username' => $this->input("username"), 'password' => $password));

		if (empty($user[0])) {
			$user = $this->user->read(array('email' => $this->input("username"), 'password' => $password));
		}

		if (empty($user[0])) {
			$this->api->error->inputField('username', 'login_incorrect');
			$this->api->error->inputField('password', 'login_incorrect');

			return null;
		} else {
			$this->user->login($user[0]);
		}

		return $user[0];
	}


	public function getOne () {
		return $this->user->current();
	}
}