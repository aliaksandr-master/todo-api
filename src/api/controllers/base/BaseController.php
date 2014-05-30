<?php



abstract class BaseResourceController implements IIntercessorResourceController {

	/** @var UserModel */
	public $user;

	/** @var Intercessor */
	protected $api = null;

	private $_filterer = null;

	private $_verifier = null;


	public function __construct ($api) {
		$this->api = $api;
		// base constructor
		$this->user = UserModel::instance();
	}


	function resource ($action) {
		$beforeActionResult = $this->beforeAction($action);
		if (!$beforeActionResult && !is_null($beforeActionResult)) {
			return null;
		}
		return call_user_func_array(array($this, $action), $this->api->request->param());
	}


	function filterData ($value, $filter, array $params = array()) {
		if (method_exists($this, 'filter_'.$filter)) {
			return $this->{'filter_'.$filter}($value, $filter, $params);
		}
		if (is_null($this->_filterer)) {
			$this->_filterer = new Filterer($this, $this->api);
		}
		return $this->_filterer->apply($value, $filter, $params);
	}


	function verifyData ($value, $rule, array $params = array(), $name = null) {
		if (method_exists($this, 'rule_'.$rule)) {
			return $this->{'rule_'.$rule}($value, $params, $name);
		}
		if (is_null($this->_verifier)) {
			$this->_verifier = new Verifier($this, $this->api);
		}

		return $this->_verifier->apply($value, $rule, $params, $name);
	}


	function prepareSuccess () {
		$status = $this->prepareResponseStatusByMethod($this->api->response->status(), $this->api->response->data(), $this->api->request->method);
		$this->api->response->status($status);
	}


	function prepareError () {
	}


	function input ($name = null, $default = null) {
		return $this->api->request->get($name, $default);
	}


	function accessError ($reason, $status = 403) {
		$this->api->error->set('access', $reason);
		$this->api->response->status($status);
	}


	function systemError ($reason, $status = 500) {
		$this->api->error->set('system', $reason);
		$this->api->response->status($status);
	}


	function hasAccess ($action) {
		$accessSpec = $this->api->getSpec('access', array());

		// CHECK ONLY OWNER
		if (!empty($accessSpec['only_owner'])) {
			// TODO: need implement ONLY_OWNER access Spec
		}

		// CHECK NEED LOGIN
		if (!empty($accessSpec['need_login']) && !$this->user->isLogged()) {
			$this->accessError('need_login', 401);

			return false;
		}

		// CHECK user permissions
		$handler = strtolower(get_class($this))."#".$action;

		$callName = strtoupper($this->api->request->method).":".$handler;
		$callNameAny = "ANY:".$handler;

		// TODO: must use ACCESS MODEL and USER MODEL to create Access-array
		$restrictions = array();

		if (isset($restrictions[$callNameAny]) && !$restrictions[$callNameAny]) {
			$this->accessError(null, 403);

			return false;
		}
		if (isset($restrictions[$callName]) && !$restrictions[$callName]) {
			$this->accessError(null, 403);

			return false;
		}

		return true;
	}


	function beforeAction ($action) {
		if (!method_exists($this, $action)) {
			$this->systemError('Method Not Allowed', 405);

			return false;
		}

		return $this->hasAccess($action);
	}


	public function prepareResponseStatusByMethod ($status, $data, $method) {

		$hasData = !empty($data);

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
					return 410; // empty GET result
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


	public function statistic () {

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

