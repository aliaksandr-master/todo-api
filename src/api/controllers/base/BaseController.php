<?php



abstract class BaseController implements IApiController, IApiDebugStatistic {

	/** @var CI_Loader */
	public $load;

	/** @var UserModel */
	public $user;

	/** @var Api */
	protected $api = null;

	const ACCESS_ONLY_OWNER = 'only_owner';

	const ACCESS_NEED_LOGIN = 'need_login';

	const FILTER_METHOD_PREF = 'filter_';

	const VALIDATOR_METHOD_PREF = 'rule_';


	public function __construct ($api) {
		$this->api = $api;
		// base constructor
		$this->user = UserModel::instance();
	}


	function compileMethodName ($action, $method, $responseType, array $methodAliasesMap) {
		if ($action === 'index') {
			$action = '';
		}
		$action = strtoupper(ApiUtils::get($methodAliasesMap, $method, $method)).'_'.strtoupper($responseType).($action || strlen($action) ? '_'.$action : '');

		return $action;
	}


	function getActionArgs ($actionName, $method, $actionMethodName, ApiRequest &$input) {
		return $input->param();
	}


	function input ($name = null, $default = null) {
		return $this->api->request->get($name, $default);
	}


	public function hasAccess (ApiComponent &$apiAccess, $accessSpec, $method, $actionName) {

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
		$handler = strtolower(get_class($this))."#".$actionName;

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
				}
			}
		}

		return $status;
	}


	public function applyValidationRule ($value, $ruleName, $params, $contextName) {
		$method = self::VALIDATOR_METHOD_PREF.$ruleName;
		if (method_exists($this, $method)) {
			return $this->$method($value, $params, $contextName);
		}

		return null;
	}


	public function applyFilter ($value, $filterName, $params, $contextName) {
		$method = self::FILTER_METHOD_PREF.$filterName;
		if (method_exists($this, $method)) {
			return $this->$method($value, $params, $contextName);
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

		$dbs = BaseCrudModel::getAllDbConnections();

		$queries = array();
		$error = array();
		$time = 0;

		foreach ($dbs as $db) {
			if (!empty($db->queries)) {
				foreach ($db->queries as $key => $query) {
					if ($db->query_times[$key]) {
						$queries[] = array('query' => $query, 'time' => $db->query_times[$key]);
					} else {
						$error[] = array('query' => $query, 'time' => $db->query_times[$key]);
					}
					$time += $db->query_times[$key];
				}
			}
		}

		return array(
			'db' => array(
				'queriesCount'  => count($queries) + count($error),
				'totalTime'     => $time,
				'errorQueries'  => $error,
				'NormalQueries' => $queries
			));
	}
}

