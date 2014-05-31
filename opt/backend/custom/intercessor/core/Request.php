<?php


namespace Intercessor;

/**
 * Class Request
 * @package Intercessor
 */
class Request extends ComponentAbstract {

	/**
	 * @param string      $specName
	 * @param string      $httpMethod
	 * @param string      $uri
	 */
	public function __construct ($specName, $httpMethod = null, $uri = null) {
		$this->_setSpec($specName)->httpMethod($httpMethod)->setUri($uri);
	}

	public function _init (Environment &$env, Request &$request, Response &$response) {
		parent::_init($env, $request, $response);
		$this->env->trace('Spec', empty($this->_spec) ? false : $this->_spec);
	}

	private $_spec = null;

	function spec ($name = null, $default = null) {
		return Utils::getArr($this->_spec, $name, $default);
	}


	/**
	 * @param $specName
	 *
	 * @return Request
	 */
	private function _setSpec ($specName) {
		if (!is_null($this->_spec)) {
			trigger_error('multiple spec set', E_USER_ERROR);
			return $this;
		}
		$this->_spec = @include(VAR_DIR.DS.'specs'.DS.sha1($specName).'.php');
		$this->_spec = empty($this->_spec) ? array() : $this->_spec;
		return $this;
	}

	/** @var IResourceController */
	private $_controller = null;


	function controller ($install = false) {
		if ($install) {
			if (!is_null($this->_controller)) {
				trigger_error('multiple controller set', E_USER_WARNING);
				return $this;
			}

			$Controller = $this->spec('controller');
			if (empty($Controller)) {
				$Controller = $this->env->default_controller;
			}
			$controller = new $Controller($this->env, $this->request, $this->response);

			if (!($controller instanceof IResourceController)) {
				trigger_error('invalid controller type', E_USER_ERROR);
			} else {
				$this->_controller = $controller;
			}
			return $this;
		}
		return $this->_controller;
	}

	/** @var string */
	private $_method = null;


	/**
	 * @param null $method
	 *
	 * @return Request|string
	 */
	function httpMethod ($method = null) {
		if (!is_null($method)) {
			if (!is_null($this->_method)) {
				trigger_error('multiple method set', E_USER_NOTICE);
			}
			$this->_method = strtoupper($method);
			return $this;
		}
		return $this->_method;
	}

	/** @var array */
	private $_uri = null;


	function uri ($name = null, $default = null) {
		return Utils::getArr($this->_uri, $name, $default);
	}

	function setUri ($uri) {
		if (!is_null($this->_uri)) {
			trigger_error('multiple method set', E_USER_NOTICE);
		}
		$this->_uri = parse_url($uri);
		return $this;
	}

	public function action () {
		return $this->spec('action');
	}

	/** @var array */
	private $_input = array();

	/** @var array */
	private $_args = array();

	/** @var array */
	private $_query = array();

	/** @var array */
	private $_body = array();

	/** @var array */
	private $_headers = array();

	/** @var array|string */
	private $_paramsSrc = array();

	/** @var array|string */
	private $_querySrc = array();

	/** @var array|string */
	private $_bodySrc = array();

	/** @var array|string */
	private $_headersSrc = null;


	/**
	 * @param array|string $body
	 *
	 * @return $this
	 */
	public function inputBody ($body) {
		$this->_bodySrc = $body;
		return $this;
	}

	/**
	 * @param array|string $query
	 *
	 * @return $this
	 */
	public function inputQuery ($query) {
		$this->_querySrc = $query;
		return $this;
	}

	/**
	 * @param array|string $value
	 *
	 * @return $this
	 */
	public function inputHeaders (array $value) {
		$this->_headers = $this->_headersSrc = $value;
		return $this;
	}

	/**
	 * @param array $value
	 *
	 * @return $this
	 */
	public function inputParams (array $value) {
		$this->_paramsSrc = $value;
		return $this;
	}

	/**
	 * @return array
	 */
	private function _parseParamsSrc () {
		return $this->_paramsSrc;
	}

	/**
	 * @return array
	 */
	function _parseBodySrc () {
		$body = $this->_bodySrc;
		if (is_string($body)) {
			$body = $this->controller()->intercessorFilterData($body, 'parse_'.$this->format(), array(), null, 'input', 'Invalid input format', 400);
			if (is_null($body)){
				$body = array();
			}
		}
		if (!is_array($body)) {
			trigger_error('invalid input body parse', E_USER_ERROR);
			return array();
		}
		return is_array($body) ? $body : array();
	}

	/**
	 * @return array
	 */
	private function _parseQuerySrc () {
		$query = $this->_querySrc;

		if (is_string($query)) {
			parse_str($query, $query);
		}
		$urlQuery = array();
		$urlSearch = Utils::get($this->_uri, 'query');
		if ($urlSearch) {
			parse_str($urlSearch, $urlQuery);
		}
		return is_array($query) && $query ? array_replace_recursive($urlQuery, $query) : $urlQuery;
	}

	private function _initInput () {
		$requestInputSpec = Utils::get($this->spec('request'), 'input', array());

		$querySpec  = Utils::get($requestInputSpec, 'query', array());
		$bodySpec   = Utils::get($requestInputSpec, 'body', array());
		$paramsSpec = Utils::get($requestInputSpec, 'params', array());

		$this->_args  = $this->_initParam($this->_parseParamsSrc(),  $paramsSpec, array(), true);
		$this->_body  = $this->_initParam($this->_parseBodySrc(),    $bodySpec,   array(), false);
		$this->_query = $this->_initParam($this->_parseQuerySrc(),   $querySpec,  $this->env->_additionalQueryParams, false);

		$this->_input = array_merge($this->_input, $this->_query, $this->_args, $this->_body);

		$this->_verifyInput($this->_args,  $paramsSpec);
		$this->_verifyInput($this->_body,  $bodySpec);
		$this->_verifyInput($this->_query, $querySpec);

		// TODO: need to implement filter after validation
	}

	/**
	 * @return Response
	 */
	function run () {
		$totalStart = gettimeofday(true);

		$this->_setErrorHandler();

		$this->publish('beforeRun');

		$this->controller(true);

		$this->_initInput();

		$this->publish('initInput');

		if ($this->spec()) {

			$this->env->trace('Launch '.$this->spec('name'));

			if ($this->valid()) {

				$this->env->trace('Call controller method', $this->action());

				$timerAction = gettimeofday(true);
				$result = $callArgs = $this->controller()->intercessorResource($this->request, $this->response);
				$this->env->timers['action'] = gettimeofday(true) - $timerAction;

				$this->env->trace('Has call data', !empty($result));

				if (!is_null($result)) {
					$this->response->data($result);
				}
			} else {
				$this->response->clear();
			}

		} else {
			$this->fatalError(null, 405);
		}

		$this->env->timers['total']  = gettimeofday(true) - $totalStart;

		$this->_restoreErrorHandler();
		return $this->response;

	}



	/** @var string */
	private $_format;

	/** @var string */
	private $_language;

	/**  @return string */
	public function format () {
		if (is_null($this->_format)) {
			$format = null;

			$contentType = Utils::get($this->_headers, 'Content-Type');
			$contentType = trim($contentType);
			$contentType = preg_replace('/;.+/', '', $contentType);

			if ($contentType) {
				foreach ($this->env->mimes as $_format => $_mimes) {
					if ($format) {
						break;
					}

					foreach ($_mimes as $mime) {
						if ($contentType === $mime) {
							$format = $_format;
							break;
						}
					}
				}
			}
			reset($this->env->mimes);
			$defaultFormat = key($this->env->mimes);
			$this->_format = $format ? $format : $defaultFormat;
		}

		return $this->_format;
	}


	/**  @return array|null */
	function language () {
		if (is_null($this->_language)) {
			$this->_language = Utils::parseQualityString($this->header('Accept-Language', ''));
		}
		return $this->_language;
	}

	private $_encoding;

	public function acceptEncoding () {
		if (is_null($this->_encoding)) {
			$this->_encoding = Utils::parseQualityString($this->request->header('Accept-Encoding'));
		}

		return $this->_encoding;
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return null
	 */
	function body ($name = null, $default = null) {
		return Utils::getArr($this->_body, $name, $default);
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return null
	 */
	function param ($name = null, $default = null) {
		return Utils::getArr($this->_args, $name, $default);
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return null
	 */
	function query ($name = null, $default = null) {
		return Utils::getArr($this->_query, $name, $default);
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return null
	 */
	function header ($name = null, $default = null) {
		return Utils::getArr($this->_headers, $name, $default);
	}


	/**
	 * @param null $name
	 * @param null $default
	 *
	 * @return null
	 */
	function get ($name = null, $default = null) {
		return Utils::getArr($this->_input, $name, $default);
	}


	/**
	 * @param $errors
	 * @param $fieldName
	 * @param $value
	 * @param $param
	 *
	 * @return bool
	 */
	private function validate (&$errors, $fieldName, $value, $param) {
		$valid = true;
		if (!empty($param['validation'])) {

			$rules = $param['validation']['rules'];
			$required = !empty($param['validation']["required"]);
			if ($required && !$this->controller()->intercessorVerifyData($value, 'required')) {
				$errors[$fieldName] = array(
					'required' => array()
				);

				return false;
			}

			if (strlen((string) $value)) {
				foreach ($rules as $rule) {
					if ($valid) {
						$ruleName = key($rule);
						$ruleParams = $rule[$ruleName];
						if (!$this->controller()->intercessorVerifyData($value, $ruleName, $ruleParams, $fieldName)) {
							$errors[$fieldName] = array(
								$ruleName => $ruleParams
							);
							$valid = false;
							break;
						}
					}
				}
			}
		}

		return $valid;
	}


	/**
	 * @param $data
	 * @param $spec
	 */
	protected function _verifyInput (&$data, &$spec) {
		$errors = array();
		foreach ($spec as $param) {
			$fieldName = $param["name"];
			$value = Utils::get($data, $fieldName, null);
			$this->validate($errors, $fieldName, $value, $param);
		}
		if ($errors) {
			$this->inputDataError($errors);
		}
	}


	/**
	 * @param       $srcData
	 * @param       $spec
	 * @param array $additional
	 * @param bool  $byIndex
	 *
	 * @return array
	 */
	function _initParam ($srcData, $spec, $additional = array(), $byIndex = false) {
		$data = array();

		$spec = array_merge($spec, $additional);
		foreach ($spec as $index => $param) {

			$fieldName = $param["name"];
			$by = $byIndex ? $index : $fieldName;

			$value = Utils::get($srcData, $by, null);

			if (!is_null($value) && !empty($param['filters'])) {
				$value = $this->controller()->intercessorFilterData($value, 'to_type', array($param["type"]));
				foreach ($param['filters'] as $filterArr) {
					foreach ($filterArr as $filterName => $filterParams) {
						$value = $this->controller()->intercessorFilterData($value, $filterName, $filterParams);
					}
				}
			}

			$data[$fieldName] = $value;
		}

		return $data;
	}


	/**
	 * @return array
	 */
	function pick () {
		$copy = array();
		$keys = func_get_args();
		foreach ($keys as $key) {
			if (!is_array($key)) {
				$key = array($key);
			}
			foreach ($key as $k) {
				if (isset($this->_input[$k])) {
					$copy[$k] = $this->_input[$k];
				}
			}
		}

		return $copy;
	}


	/**
	 * @return array
	 */
	function omit () {
		$copy = array();
		foreach ($this->_input as $k => $v) {
			$copy[$k] = $v;
		}
		$keys = func_get_args();
		foreach ($keys as $key) {
			if (!is_array($key)) {
				$key = array($key);
			}
			foreach ($key as $k) {
				unset($copy[$k]);
			}
		}

		return $copy;
	}


	/**
	 * @param array $names
	 * @param array $nameMap
	 * @param bool  $withoutEmpty
	 *
	 * @return array
	 */
	function pipe (array $names, array $nameMap = array(), $withoutEmpty = true) {
		$values = array();
		foreach ($this->_input as $name => $val) {
			if (isset($nameMap[$name])) {
				$name = $nameMap[$name];
			}
			$values[$name] = $val;
		}
		$data = array();
		foreach ($names as $f => $s) {
			if (is_numeric($f)) {
				if (isset($values[$s])) {
					$data[$s] = $values[$s];
				} else {
					if (!$withoutEmpty) {
						$data[$s] = null;
					}
				}
			} else {
				if (isset($values[$f])) {
					$data[$f] = $values[$f];
				} else {
					if (isset($s) || !$withoutEmpty) {
						$data[$f] = $s;
					}
				}
			}
		}

		return $data;
	}
}