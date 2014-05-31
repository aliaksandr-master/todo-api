<?php



/**
 * Class BaseResourceController
 */
class BaseResourceController implements Intercessor\IResourceController {

	/** @var UserModel */
	public $user;

	/**
	 * @var Filterer
	 */
	private $_filterer;

	/**
	 * @var Verifier
	 */
	private $_verifier;

	/**
	 * @var Intercessor\Request
	 */
	public $request;

	/**
	 * @var Intercessor\Response
	 */
	public $response;


	public final function __construct (Intercessor\Environment &$environment, Intercessor\Request &$request, Intercessor\Response &$response) {
		$this->intercessor = &$environment;
		$this->request     = &$request;
		$this->response    = &$response;

		$this->_filterer = new Filterer($this, $this->request, $this->response);

		$this->init(); // construct for child
	}

	public function init () {
		$this->user = UserModel::instance();
	}


	/**
	 * @return mixed|null
	 */
	public function intercessorResource () {
		$action = $this->request->action();
		$beforeActionResult = $this->beforeAction();
		if (!$beforeActionResult && !is_null($beforeActionResult)) {
			return null;
		}
		return call_user_func_array(array($this, $action), $this->request->param());
	}


	/**
	 * @param mixed  $value
	 * @param string $filter
	 * @param array  $params
	 *
	 * @return mixed
	 */
	function intercessorFilterData ($value, $filter, array $params = array()) {
		return $this->filterData ($value, $filter, $params);
	}


	/**
	 * @param       $value
	 * @param       $filter
	 * @param array $params
	 *
	 * @return mixed
	 */
	function filterData ($value, $filter, array $params = array()) {
		if (method_exists($this, 'filter_'.$filter)) {
			return $this->{'filter_'.$filter}($value, $filter, $params);
		}
		if (is_null($this->_filterer)) {

		}
		return $this->_filterer->apply($value, $filter, $params);
	}


	/**
	 * @param mixed  $value
	 * @param string $ruleName
	 * @param array  $params
	 * @param null   $name
	 *
	 * @return mixed
	 */
	function intercessorVerifyData ($value, $ruleName, array $params = array(), $name = null) {
		return $this->verifyData ($value, $ruleName, $params, $name);
	}


	/**
	 * @param       $value
	 * @param       $rule
	 * @param array $params
	 * @param null  $name
	 *
	 * @return mixed
	 */
	function verifyData ($value, $rule, array $params = array(), $name = null) {
		if (method_exists($this, 'rule_'.$rule)) {
			return $this->{'rule_'.$rule}($value, $params, $name);
		}
		if (is_null($this->_verifier)) {
			$this->_verifier = new Verifier($this);
		}

		return $this->_verifier->apply($value, $rule, $params, $name);
	}


	/**
	 * @param \Intercessor\Request  $request
	 * @param \Intercessor\Response $response
	 */
	function intercessorPrepareSuccess (Intercessor\Request &$request, Intercessor\Response &$response) {
		$status = $this->prepareResponseStatusByMethod($response->status(), $response->data(), $request->httpMethod());
		$response->status($status);
	}


	/**
	 * @param \Intercessor\Request  $request
	 * @param \Intercessor\Response $response
	 */
	function intercessorPrepareError (Intercessor\Request &$request, Intercessor\Response &$response) {
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return mixed
	 */
	function input ($name = null, $default = null) {
		return $this->request->get($name, $default);
	}


	/**
	 * @param     $reason
	 * @param int $status
	 */
	function accessError ($reason, $status = 403) {
		$this->response->newError('access', $reason);
		$this->response->status($status);
	}


	function fieldError ($fieldName, $reason, $params = array()) {
		$this->request->inputFieldError($fieldName, $reason, $params);
		$this->response->status(400);
	}


	/**
	 * @param     $reason
	 * @param int $status
	 */
	function systemError ($reason, $status = 500) {
		$this->response->fatalError('system', $reason);
		$this->response->status($status);
	}


	function hasAccess () {
		$accessSpec = $this->request->spec('access', array());
		$action     = $this->request->action();

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

		$callName = strtoupper($this->request->httpMethod()).":".$handler;
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


	function beforeAction () {
		if (!method_exists($this, $this->request->action())) {
			$this->systemError('Method Not Allowed', 405);

			return false;
		}

		return $this->hasAccess();
	}


	/**
	 * @param $status
	 * @param $data
	 * @param $method
	 *
	 * @return int
	 */
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




	/**
	 * @param array $output
	 * @param bool $debugMode
	 *
	 * @return array
	 */
	public function intercessorPrepareOutput (array $output, $debugMode) {
		if ($debugMode) {
			$output['debug']['timers']['total'] = defined('START_TIMESTAMP') ? gettimeofday(true) - START_TIMESTAMP : 0;
			$output['debug']['timers']['db'] = 0;
			$output['debug']['memory']['usage']  = memory_get_usage(true) - START_MEMORY;
			$output['debug']['db'] = array();

			// DB DEBUG INFO
			$dbs = BaseCrudModel::getAllDbConnections();

			foreach ($dbs as $db) {
				if (!empty($db->queries)) {
					foreach ($db->queries as $key => $query) {
						$data = array();
						if (!$db->query_times[$key]) {
							$data['fail'] = $query;
						} else {
							$data['pass'] = $query;
							$data['time'] = $db->query_times[$key];
						}
						$output['debug']['db'][] = $data;
						$output['debug']['timers']['db'] += $db->query_times[$key];
					}
				}
			}

		}
		return $output;
	}
}

