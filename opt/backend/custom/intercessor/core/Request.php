<?php


namespace Intercessor;

/**
 * Class Request
 * @package Intercessor
 */
class Request extends ComponentAbstract {

	/** @var array */
	private $_spec = array();

	/** @var array */
	private $_uri = array();

	/** @var string */
	private $_method;

	/** @var IResourceController */
	private $_controller = null;

	/** @var array */
	private $_src = array (
		'uri'     => null,
		'body'    => array(),
		'query'   => array(),
		'params'  => array(),
		'headers' => array(),
	);

	/**
	 * @param string      $specName
	 * @param string      $httpMethod
	 * @param string      $uri
	 */
	public function __construct ($specName, $httpMethod, $uri) {
		$this->_src['spec'] = $specName;
		$this->_src['uri'] = $uri;
		$this->_src['method'] = $httpMethod;

		$_spec = @include(VAR_DIR.DS.'specs'.DS.sha1($specName).'.php');
		if (!empty($_spec)) {
			$this->_spec = $_spec;
		}

		$this->_uri = parse_url($uri);
		foreach (pathinfo($this->uri('path')) as $info => $value) {
			$this->_uri['path/'.$info] = $value;
		}

		$this->_method = strtoupper($httpMethod);
	}

	function spec ($name = null, $default = null) {
		return Utils::getArr($this->_spec, $name, $default);
	}

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


	/**
	 * @return Request|string
	 */
	function httpMethod () {
		return $this->_method;
	}


	function uri ($name = null, $default = '') {
		return Utils::getArr($this->_uri, $name, $default);
	}

	public function action () {
		return $this->spec('action');
	}

	/** @var array */
	private $_input = array();

	/** @var array */
	private $_params = array();

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
	private function _parseBodySrc () {
		$body = $this->_bodySrc;
		if (is_string($body)) {
			$body = $this->controller()->intercessorFilterData($body, 'parse_'.$this->request->inputFormat(), array(), null, 'input', 'Invalid input format', 400);
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

	private function _initInputData () {
		$requestInputSpec = Utils::get($this->spec('request'), 'input', array());

		$querySpec  = Utils::get($requestInputSpec, 'query', array());
		$bodySpec   = Utils::get($requestInputSpec, 'body', array());
		$paramsSpec = Utils::get($requestInputSpec, 'params', array());

		$this->_params = $this->_initInput($this->_parseParamsSrc(),  $paramsSpec, array(), false);
		$this->_body   = $this->_initInput($this->_parseBodySrc(),    $bodySpec,   array(), false);
		$this->_query  = $this->_initInput($this->_parseQuerySrc(),   $querySpec,  $this->env->_additionalQueryParams, false);

		$this->_input = array_merge($this->_input, $this->_query, $this->_params, $this->_body);

		$this->_verifyInput($this->_params,  $paramsSpec);
		$this->_verifyInput($this->_body,  $bodySpec);
		$this->_verifyInput($this->_query, $querySpec);

		// TODO: need to implement filter after validation
		$this->publish('initInputData');
	}


	/**
	 * @param       $srcData
	 * @param       $spec
	 * @param array $additional
	 * @param bool  $byIndex
	 *
	 * @return array
	 */
	function _initInput ($srcData, $spec, $additional = array(), $byIndex = false) {
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
	 * @return Response
	 */
	function run () {
		$totalStart = gettimeofday(true);

		$this->_setErrorHandler();

		$this->publish('beforeRun');

		$this->controller(true);

		$this->_initInputData();

		if ($this->spec()) {

			if ($this->valid()) {
				$this->publish('beforeActionCall');

				$timerAction = gettimeofday(true);
				$result = $this->controller()->intercessorResource();
				$this->env->timers['action'] = gettimeofday(true) - $timerAction;

				if ($this->valid() && !is_null($result)) {
					$this->response->data($result);
				}

				$this->publish('afterActionCall');
			} else {
				$this->response->clear();
				$this->response->freeze();
			}

		} else {
			$this->fatalError(null, 405);
		}


		$this->publish('afterRun');

		$this->env->timers['total intercessor']  = gettimeofday(true) - $totalStart;

		$this->_restoreErrorHandler();
		return $this->response;

	}

	private $_outputMime = null;


	public function outputMime () {
		if (is_null($this->_outputMime)) {
			$this->_outputMime = $this->env->mimes[$this->request->outputFormat()][0];
		}
		return $this->_outputMime;
	}


	public function dataOffset () {
		return $this->request->query($this->env->offset_query_param, 0);
	}


	public function dataLimit () {
		$max = $this->dataMaxLimit();
		$_limit = $this->request->query($this->env->limit_query_param, $max);
		return $_limit < $max ? $_limit : $max;
	}

	public function dataMaxLimit () {
		return Utils::get(Utils::get($this->request->spec('response'), 'output', array()), 'limit', 1);
	}

	public function responseType () {
		$limit = Utils::get(Utils::get($this->request->spec('response'), 'output', array()), 'limit', null);
		return is_null($limit) ? Response::TYPE_ONE : Response::TYPE_MANY;
	}


	private $_outputFormat = null;

	public function outputFormat () {
		if (is_null($this->_outputFormat)) {
			$format = Utils::getFileFormatByFileExt($this->request->uri('path'), $this->env->mimes, null);

			if (!is_null($format)) {
				$accept = Utils::parseQualityString($this->request->header('Accept', ''));
				$format = Utils::getFormatByHeadersAccept($accept, $this->env->mimes, null);
			}

			if (is_null($format)) {
				$format = $this->env->default_response_format;
			}

			if (!Utils::get($this->env->mimes, $format)) {
				$format = $this->env->default_response_format;
				$this->formatError('invalid output format', 400);
			}

			$this->_outputFormat = $format;
		}

		return $this->_outputFormat;
	}


	/** @var string */
	private $_inputFormat;

	/**  @return string */
	public function inputFormat () {
		if (is_null($this->_inputFormat)) {
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

			$this->_inputFormat = $format ? $format : $defaultFormat;

			if (!Utils::get($this->env->mimes, $this->_inputFormat)) {
				$this->formatError('invalid input format', 400);
			}
		}

		return $this->_inputFormat;
	}


	/** @var string */
	private $_language;

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
	 * @param string $name
	 * @param mixed $default
	 *
	 * @return mixed
	 */
	function body ($name = null, $default = null) {
		return Utils::getArr($this->_body, $name, $default);
	}


	/**
	 * @param string $name
	 * @param mixed $default
	 *
	 * @return mixed
	 */
	function param ($name = null, $default = null) {
		return Utils::getArr($this->_params, $name, $default);
	}


	/**
	 * @param string $name
	 * @param mixed $default
	 *
	 * @return mixed
	 */
	function query ($name = null, $default = null) {
		return Utils::getArr($this->_query, $name, $default);
	}



	/**
	 * @param string $name
	 * @param mixed $default
	 *
	 * @return mixed
	 */
	function header ($name = null, $default = null) {
		return Utils::getArr($this->_headers, $name, $default);
	}



	/**
	 * @param string $name
	 * @param mixed $default
	 *
	 * @return mixed
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
	private function _validateField (&$errors, $fieldName, $value, $param) {
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
			$this->_validateField($errors, $fieldName, $value, $param);
		}
		if ($errors) {
			$this->inputDataError($errors);
		}
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