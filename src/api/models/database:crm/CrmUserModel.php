<?php



class CrmUserModel extends CrmDbModel implements IUserSession, IUser {

	function getSessionCell () {
		return '/crm/user';
	}


	public function cryptPassword ($value) {
		return md5($value);
	}


	public function current ($dataName = null, $default = null) {
		if (!is_null($dataName)) {
			return isset($_SESSION[$this->getSessionCell()][$dataName]) ? $_SESSION[$this->getSessionCell()][$dataName] : $default;
		}

		return isset($_SESSION[$this->getSessionCell()]) ? $_SESSION[$this->getSessionCell()] : array();
	}


	public function login ($user) {
		$_SESSION[$this->getSessionCell()] = $user;
	}


	public function logout () {
		unset($_SESSION[$this->getSessionCell()]);
		$_SESSION[$this->getSessionCell()] = array();
	}


	public function isLogged () {
		return !empty($_SESSION[$this->getSessionCell()]);
	}
}