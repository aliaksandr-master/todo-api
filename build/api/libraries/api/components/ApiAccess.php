<?php



class ApiAccess extends ApiComponent {

	const ONLY_OWNER = 'only_owner';

	const NEED_LOGIN = 'need_login';

	const ACTION = 'action';

	const UNDEFINED = 'api_undefined';

	const IP_WHITE_LIST = 'ip_white_list';

	const IP_BLACK_LIST = 'ip_black_list';


	private $_accesses = array();


	function init () {
		$this->_accesses = $this->api->getSpec('access');
	}


	function check () {
		$this->checkNeedLogin();
		$this->checkContextToCall();
	}


	protected function checkIpBlackList () {
		if (empty($this->_accesses[ApiAccess::IP_BLACK_LIST])) {
			return;
		}

		$blacklist = $this->_accesses[ApiAccess::IP_BLACK_LIST];
		foreach ($blacklist as &$ip) {
			$ip = trim($ip);
		}
		if (in_array($this->api->getLaunchParam('ip'), $blacklist)) {
			$this->error(null, 401, true);
		}
	}


	function checkNeedLogin () {
		if (!empty($this->_accesses[ApiAccess::NEED_LOGIN]) && !$this->api->context->hasAuth()) {
			$this->error(ApiAccess::NEED_LOGIN, 401, true);
			$this->api->output->send();
		}
	}


	function checkContextToCall () {
		$controllerName = get_class($this->api->context);
		$hasAccess = $this->api->context->hasAccess($this->api->getLaunchParam('method'), $controllerName, $this->api->getLaunchParam('action_to_call'));
		if (!$hasAccess) {
			$this->error(ApiAccess::ACTION, 403);
			$this->api->output->send();
		}

		return $hasAccess;
	}


	function onlyOwner () {
		return !empty($this->_accesses[ApiAccess::ONLY_OWNER]);
	}
}