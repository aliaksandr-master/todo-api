<?php

restore_error_handler();
restore_exception_handler();



abstract class BaseController extends CI_Controller implements IApiController, IApiDebugStatistic {

	/** @var CI_Loader */
	public $load;

	/** @var UserModel */
	public $user;

	/** @var Api */
	protected $api = null;

	const ACCESS_ONLY_OWNER = 'only_owner';

	const ACCESS_NEED_LOGIN = 'need_login';

	public function __construct () {
		parent::__construct();
		// base constructor
		$this->user = UserModel::instance();
	}


	public function _remap ($action, $arguments) {

		$url = str_replace(API_ROOT_URL, '', $_SERVER['REQUEST_URI']);

		$this->api = new Api($_SERVER["REQUEST_METHOD"], $url, array(
			'input/body' => INPUT_DATA,
			'input/args' => $arguments,
			'input/query' => array(),
			'input/headers' => getallheaders()
		));

		$this->api->launch($this, $action);
		$this->api->send(true);
	}


	function compileMethodName ($action, $method, $responseType, array $methodAliasesMap) {
		if ($action === 'index') {
			$action = '';
		}
		$action = strtoupper(ApiUtils::get($methodAliasesMap, $method, $method)).'_'.strtoupper($responseType).($action || strlen($action) ? '_'.$action : '');

		return $action;
	}


	function getActionArgs ($actionName, $method, $actionMethodName, ApiRequest &$input) {
		return $input->arg();
	}


	function input ($name = null, $default = null) {
		return $this->api->input->get($name, $default);
	}


	public function hasAccess (ApiComponent &$apiAccess, array $accessSpec, $method, $actionName, $methodName) {

		// CHECK ONLY OWNER
		if (!empty($accessSpec[static::ACCESS_ONLY_OWNER])) {
			// TODO: need implement ONLY_OWNER access Spec
		}

		// CHECK NEED LOGIN
		if (!empty($accessSpec[static::ACCESS_NEED_LOGIN])) {
			if (!$this->user->isLogged()) {
				$apiAccess->error(static::ACCESS_NEED_LOGIN, 401);

				return false;
			}
		}

		// CHECK user permissions
		$handler = strtolower(get_class($this))."#".$methodName;

		$callName = strtoupper($method).":".$handler;
		$callNameAny = "ANY:".$handler;

		// TODO: must use ACCESS MODEL and USER MODEL to create Access-array
		$restrictions = array();

		if (isset($restrictions[$callNameAny]) && !$restrictions[$callNameAny]) {
			$apiAccess->error(null, 403);

			return false;
		}
		if (isset($restrictions[$callName]) && !$restrictions[$callName]) {
			$apiAccess->error(null, 403);

			return false;
		}

		return true;
	}


	public function prepareResponseStatusByMethod ($status, $response, $method) {

		$hasData = !empty($response['data']);

		if ($method == "POST") {
			if ($hasData) {
				return 201; // created new element
			} else {
				return 404; // empty GET result
			}
		} else {
			if ($method == "PUT") {
				if ($hasData) {
					return 200; // updated resource
				} else {
					return 500; // empty GET result
				}
			} else {
				if ($method == "GET") {
					if (!$hasData) {
						return 404;
					}
				} else {
					if ($method == "DELETE") {
						if (!$hasData) {
							return 500; // you must send Boolean response
						}
					}
				}
			}
		}

		return $status;
	}


	public function applyValidationRule ($value, $ruleName, $params, $contextName) {
		$method = '_rule__'.$ruleName;
		if (method_exists($this->api->context, $method)) {
			return $this->api->context->$method($value, $params, $contextName);
		}

		return null;
	}


	public function applyFilter ($value, $filterName, $params, $contextName) {
		$method = '_filter__'.$filterName;
		if (method_exists($this->api->context, $method)) {
			return $this->api->context->$method($value, $params, $contextName);
		}

		return null;
	}


	public function toType ($value, $type, $param = null) {
		switch ($type) {
			case 'decimal':
			case 'integer':
				return intval(trim((string) $value));
			case 'float':
				return floatval(trim((string) $value));
			case 'boolean':
				return (bool) $value;
		}
		return trim((string) $value); // default type = string
	}


	public function debugStatistic () {

		$dbs = BaseCrudModel::getAllArDb();

		$queries = array();
		$error = array();
		$time = 0;

		foreach ($dbs as $db) {
			if (!empty($db->queries)) {
				foreach ($db->queries as $key => $query) {
					if ($db->query_times[$key]) {
						$queries[] = array(
							'query' => $query,
							'time' => $db->query_times[$key]
						);
					} else {
						$error[] = array(
							'query' => $query,
							'time' => $db->query_times[$key]
						);
					}
					$time += $db->query_times[$key];
				}
			}
		}

		return array(
			'db' => array(
				'queriesCount' => count($queries) + count($error),
				'totalTime' => $time,
				'errorQueries' => $error,
				'NormalQueries' => $queries
			)
		);
	}
}

