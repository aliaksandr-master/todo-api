<?php



class ApiRequest extends ApiComponent {

	const DEFAULT_FORMAT = 'form';

	private $_input = array();

	private $_args = array();
	private $_query = array();
	private $_body = array();
	private $_headers = array();

	private $_argsSource = null;
	private $_querySource = null;
	private $_bodySource = null;
	private $_headersSource = null;

	private $_additionalQueryParams = array(
		array(
			'name' => '_virtual',
			'type' => 'boolean'
		),
		array(
			'name' => 'limit',
			'type' => 'decimal'
		),
		array(
			'name' => 'offset',
			'type' => 'decimal'
		)
	);

	private $_additionalBodyParams = array();

	private $_format = null;
	private $_language = null;

	public function beforeLaunch () {
		parent::beforeLaunch();

		$requestInput = ApiUtils::get($this->api->getSpec('request'), 'input', array());

		$this->_headers = $this->getHeadersSrc();
		$this->_query = $this->_initParam($this->getQuerySrc(), ApiUtils::get($requestInput, 'query', array()), $this->_additionalQueryParams, false);
		$this->_body = $this->_initParam($this->getBodySrc(), ApiUtils::get($requestInput, 'body', array()), $this->_additionalBodyParams, false);
		$this->_args = $this->_initParam($this->getArgsSrc(), ApiUtils::get($requestInput, 'args', array()), array(), true);

		$this->_input = array_merge($this->_input, $this->_query, $this->_args, $this->_body);
	}

	function getHeadersSrc () {
		if (is_null($this->_headersSource)) {
			$this->_headersSource = $this->api->getParam('input/headers');
		}
		return $this->_headersSource;
	}

	function getBodySrc () {
		if (is_null($this->_bodySource)) {
			$body = $this->api->getParam('input/body');
			if (is_string($body)) {
				$body = $this->api->filter->apply($body, 'parse_'.$this->getFormat(), array(), null, 'input', 'Invalid input format', 400);
			}
			$this->_bodySource = is_array($body) ? $body : array();
		}
		return $this->_bodySource;
	}

	function getQuerySrc () {
		if (is_null($this->_querySource)) {
			$query = $this->api->getParam('input/query');
			if (is_string($query)) {
				parse_str($query, $query);
			}
			$urlQuery = array();
			if ($this->api->getParam('url/search')) {
				parse_str($this->api->getParam('url/search'), $urlQuery);
			}
			$this->_querySource = is_array($query) && $query ? array_replace_recursive($urlQuery, $query) : $urlQuery;
		}
		return $this->_querySource;
	}

	function getArgsSrc () {
		if (is_null($this->_argsSource)) {
			$this->_argsSource = $this->api->getParam('input/args');
		}
		return $this->_argsSource;
	}


	public function getFormat () {
		if (is_null($this->_format)) {
			$format = null;

			$contentType = ApiUtils::get($this->_headers, 'Content-Type');
			$contentType = trim($contentType);
			$contentType = preg_replace('/;.+/', '', $contentType);

			if ($contentType) {
				foreach ($this->api->mimes as $_format => $_mimes) {
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

			$this->_format = $format ? $format : self::DEFAULT_FORMAT;
		}
		return $this->_format;
	}

	function getLanguage () {
		if (is_null($this->_language)) {
			$this->_language = ApiUtils::parseQualityString($this->header('Accept-Language', ''));
		}
		return $this->_language;
	}

	function beforeActionCall () {
		$requestInput = ApiUtils::get($this->api->getSpec('request'), 'input', array());

		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'query', array()), $this->_query);
		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'body',  array()), $this->_body);
		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'args',  array()), $this->_args);
	}


	function body ($name = null, $default = null) {
		return ApiUtils::getArr($this->_body, $name, $default);
	}


	function arg ($name = null, $default = null) {
		return ApiUtils::getArr($this->_args, $name, $default);
	}


	function query ($name = null, $default = null) {
		return ApiUtils::getArr($this->_query, $name, $default);
	}


	function header ($name = null, $default = null) {
		return ApiUtils::getArr($this->_headers, $name, $default);
	}


	function get ($name = null, $default = null) {
		return ApiUtils::getArr($this->_input, $name, $default);
	}


	function _initParam ($pData, $apiData, $additional = array(), $byIndex = false) {
		$data = array();
		$source = array();

		$_apiData = array();
		$_apiData = array_merge($_apiData, $apiData, $additional);
		if ($_apiData) {
			foreach ($_apiData as $index => $param) {

				$fieldName = $param["name"];
				$by = $byIndex ? $index : $fieldName;

				$value = ApiUtils::get($pData, $by, null);

				if (!is_null($value)) {
					$source[$fieldName] = $value;
					if (!empty($param['filters']['before'])) {
						$value = $this->api->filter->applyFilters($value, $param['filters']['before'], $fieldName);
					}
					$data[$fieldName] = $this->api->context->toType($value, $param["type"], $param);
				}
			}
		}

		return $data;
	}


	function _applyAfterFiltersToParam ($requestInputData, &$data) {
		foreach ($requestInputData as $param) {
			$fieldName = $param['name'];
			$value = ApiUtils::get($data, $fieldName, null);
			if (!is_null($value)) {
				if (!empty($param['filters']['after'])) {
					$value = $this->api->filter->applyFilters($value, $param['filters']['after'], $fieldName);
				}
				$data[$fieldName] = $value;
			}
		}
	}


	private function _checkParam ($requestInputData, $data) {
		$valid = 1;
		foreach ($requestInputData as $param) {
			$value = ApiUtils::get($data, $param['name'], null);
			if (!empty($param['validation'])) {
				$valid *= $this->api->validation->validate($param["name"], $value, $param['validation'], true);
			}
		}

		return $valid;
	}


	function check () {
		$valid = 1;
		$requestInput = ApiUtils::get($this->api->getSpec('request'), 'input', array());
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'args', array()), $this->_args);
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'body', array()), $this->_body);
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'query', array()), $this->_query);
		if (!$valid) {
			$this->api->output->send();
		}
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
		return $this->get($name);
	}
}