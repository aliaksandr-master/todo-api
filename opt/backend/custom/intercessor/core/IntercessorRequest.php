<?php



class IntercessorRequest extends IntercessorAbstractComponent {

	public $method = null;

	public $uri = null;

	public $uriPathname = null;

	public $uriSearch = null;

	public $action = null;

	private $_input = array();

	private $_args = array();

	private $_query = array();

	private $_body = array();

	private $_headers = array();

	private $_argsSource = null;

	private $_querySource = null;

	private $_bodySource = null;

	private $_headersSource = null;

	const VIRTUAL_FAILURE_QUERY_PARAM = 'virtual_failure';

	const LIMIT_PARAM_NAME = 'limit';

	const OFFSET_PARAM_NAME = 'offset';

	private $_additionalQueryParams = array(
		array(
			'name' => self::VIRTUAL_FAILURE_QUERY_PARAM,
			'type' => 'boolean'
		),
		array(
			'name' => self::LIMIT_PARAM_NAME,
			'type' => 'decimal'
		),
		array(
			'name' => self::OFFSET_PARAM_NAME,
			'type' => 'decimal'
		)
	);

	private $_additionalBodyParams = array();

	private $_format = null;

	private $_language = null;


	public function _configure ($name, $method, $uri, array $params) {

		$this->method = strtoupper($method);

		$this->uri = $uri;
		$this->uriPathname = preg_replace('/^([^\?]+)\?(.*)$/', '$1', $uri);
		$this->uriSearch = preg_replace('/^([^\?]+)\?(.*)$/', '$2', $uri);

		$this->_initHeadersSrc(IntercessorUtils::get($params, 'headers', array()));
		$this->_headers = $this->getHeadersSrc();

		$this->_initArgsSrc(IntercessorUtils::get($params, 'params', array()));
		$this->_initQuerySrc(IntercessorUtils::get($params, 'query', array()));
		$this->_initBodySrc(IntercessorUtils::get($params, 'body', array()));

		$requestInputSpec = IntercessorUtils::get($this->kernel->getSpec('request'), 'input', array());

		$querySpec = IntercessorUtils::get($requestInputSpec, 'query', array());
		$bodySpec = IntercessorUtils::get($requestInputSpec, 'body', array());
		$paramsSpec = IntercessorUtils::get($requestInputSpec, 'params', array());

		$this->_args = $this->_initParam($this->getArgsSrc(), $paramsSpec, array(), true);
		$this->_body = $this->_initParam($this->getBodySrc(), $bodySpec, $this->_additionalBodyParams, false);
		$this->_query = $this->_initParam($this->getQuerySrc(), $querySpec, $this->_additionalQueryParams, false);

		$this->_input = array_merge($this->_input, $this->_query, $this->_args, $this->_body);

		$this->_checkParam($this->_args, $paramsSpec);
		$this->_checkParam($this->_body, $bodySpec);
		$this->_checkParam($this->_query, $querySpec);
	}


	protected function _initQuerySrc ($query) {
		if (is_string($query)) {
			parse_str($query, $query);
		}
		$urlQuery = array();
		if ($this->uriSearch) {
			parse_str($this->uriSearch, $urlQuery);
		}
		$this->_querySource = is_array($query) && $query ? array_replace_recursive($urlQuery, $query) : $urlQuery;

		return $this->_querySource;
	}


	protected function _initArgsSrc ($args) {
		$this->_argsSource = $args;

		return $this->_argsSource;
	}


	protected function _initHeadersSrc ($src) {
		$this->_headersSource = $src;

		return $this->_headersSource;
	}


	protected function _initBodySrc ($body) {
		if (is_string($body)) {
			$body = $this->kernel->context->filterData($body, 'parse_'.$this->getFormat(), array(), null, 'input', 'Invalid input format', 400);
		}
		$this->_bodySource = is_array($body) ? $body : array();

		return $this->_bodySource;
	}


	function getHeadersSrc () {
		return $this->_headersSource;
	}


	function getBodySrc () {
		return $this->_bodySource;
	}


	function getArgsSrc () {
		return $this->_argsSource;
	}


	function getQuerySrc () {
		return $this->_querySource;
	}


	public function getFormat () {
		if (is_null($this->_format)) {
			$format = null;

			$contentType = IntercessorUtils::get($this->_headers, 'Content-Type');
			$contentType = trim($contentType);
			$contentType = preg_replace('/;.+/', '', $contentType);

			if ($contentType) {
				foreach ($this->kernel->loader->mimes as $_format => $_mimes) {
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
			reset($this->kernel->loader->mimes);
			$defaultFormat = key($this->kernel->loader->mimes);
			$this->_format = $format ? $format : $defaultFormat;
		}

		return $this->_format;
	}


	function getLanguage () {
		if (is_null($this->_language)) {
			$this->_language = IntercessorUtils::parseQualityString($this->header('Accept-Language', ''));
		}

		return $this->_language;
	}


	function body ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_body, $name, $default);
	}


	function param ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_args, $name, $default);
	}


	function query ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_query, $name, $default);
	}


	function header ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_headers, $name, $default);
	}


	function get ($name = null, $default = null) {
		return IntercessorUtils::getArr($this->_input, $name, $default);
	}


	private function validate (&$errors, $fieldName, $value, $param) {
		$valid = true;
		if (!empty($param['validation'])) {

			$rules = $param['validation']['rules'];
			$required = !empty($param['validation']["required"]);
			if ($required && !$this->kernel->context->verifyData($value, 'required')) {
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
						if (!$this->kernel->context->verifyData($value, $ruleName, $ruleParams, $fieldName)) {

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

	protected function _checkParam (&$data, &$spec) {
		$errors = array();
		foreach ($spec as $index => $param) {
			$fieldName = $param["name"];
			$value = IntercessorUtils::get($data, $fieldName, null);
			$this->validate($errors, $fieldName, $value, $param);
		}
		if ($errors) {
			$this->kernel->error->inputData($errors);
		}
	}

	function _initParam ($srcData, $spec, $additional = array(), $byIndex = false) {
		$data = array();

		$spec = array_merge($spec, $additional);
		foreach ($spec as $index => $param) {

			$fieldName = $param["name"];
			$by = $byIndex ? $index : $fieldName;

			$value = IntercessorUtils::get($srcData, $by, null);

			if (!is_null($value) && !empty($param['filters'])) {
				$value = $this->kernel->context->filterData($value, 'to_type', array($param["type"]));
				foreach ($param['filters'] as $filterArr) {
					foreach($filterArr as $filterName => $filterParams) {
						$value = $this->kernel->context->filterData($value, $filterName, $filterParams);
					}
				}
			}

			$data[$fieldName] = $value;
		}

		return $data;
	}


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


	function __get ($name) {
		preg_match('/^(body|query|param)_(.+)$/', $name, $match);
		dump($match);
		return $this->get($name);
	}
}