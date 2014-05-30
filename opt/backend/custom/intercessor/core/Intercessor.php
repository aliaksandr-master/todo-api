<?php



class Intercessor extends IntercessorAbstract {

	/** @var IIntercessorResourceController */
	public $context;

	/** @var IntercessorRequest */
	public $request;

	/** @var IntercessorResponse */
	public $response;

	/** @var IntercessorLoader */
	public $loader;

	/** @var IntercessorError */
	public $error;


	private $_spec;

	protected $_logs = array();

	public $timers = array();


	function __construct (IntercessorLoader &$loader) {
		$this->loader = $loader;
		$this->error = new IntercessorError($this);
		$this->request = new IntercessorRequest($this);
		$this->response = new IntercessorResponse($this);
	}


	public function _configure ($name, $method, $uri, array $params) {
		$this->_spec = @include(VAR_DIR.DS.'specs'.DS.sha1($name).'.php');
		$this->_spec = empty($this->_spec) ? array() : $this->_spec;

		$this->trace('Spec', empty($this->_spec) ? false : $name);

		$this->timers['action'] = 0;
	}


	function run ($name, $method, $uri, array $params) {

		$this->error->_setHandler();

		$this->_configure($name, $method, $uri, $params);

		$this->timers['launch'] = gettimeofday(true);

		if (!$this->_spec) {
			$this->error->system(null, 405);

			return $this->response->compile();
		}

		$this->request->action = $this->getSpec('action');

		$this->trace('Launch width  '.$this->getSpec('controller').'->'.$this->request->action);

		$Controller = $this->getSpec('controller');
		$this->context = new $Controller($this);

		$this->response->_configure($name, $method, $uri, $params);
		$this->request->_configure($name, $method, $uri, $params);

		if ($this->valid()) {

			$this->trace('Call controller method', $this->request->action);

			$timerAction = gettimeofday(true);
			$result = $callArgs = $this->context->resource($this->request->action);
			$this->timers['action'] = gettimeofday(true) - $timerAction;

			$this->trace('Has call data', !empty($result));

			if (!is_null($result)) {
				$this->response->data($result);
			}
		} else {
			$this->response->clear();
		}

		$result = $this->response->compile();

		$this->error->_restoreHandler();

		return $result;
	}


	function __destruct () {
		$this->error->_restoreHandler();
	}


	function valid () {
		return !$this->error->get() && $this->response->getSuccessByStatus($this->response->status());
	}


	function trace ($markName, $data = null) {
		if ($this->loader->debug) {
			if (!is_object($data) && !is_array($data) && !is_null($data)) {
				if (is_bool($data)) {
					$data = $data ? 'true' : 'false';
				}
				$markName .= ': '.$data;
				$data = null;
			}
			if (is_null($data)) {
				$this->_logs[] = $markName;
			} else {
				$this->_logs[][$markName] = $data;
			}
		}
	}


	function getStackTrace () {
		return $this->_logs;
	}


	function getSpec ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_spec, $name, $default);
	}
}