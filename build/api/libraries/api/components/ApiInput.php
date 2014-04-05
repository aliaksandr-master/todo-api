<?php



class ApiInput extends ApiComponent {

	const DEFAULT_FORMAT = 'form';
	const DEFAULT_LANGUAGE = 'en';

	private $_input = array();

	private $_url = array();
	private $_query = array();
	private $_body = array();
	private $_headers = array();

	private $_urlSource = null;
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

	public function __construct ($api) {
		parent::__construct($api);

		$requestInput = ApiUtils::get($this->api->getSpec('request'), 'input', array());

		// HEADERS
		$this->_headers = $this->getHeadersSrc();

		// QUERY
		$query = $this->getQuerySrc();
		$this->_query = $this->_initParam($query, ApiUtils::get($requestInput, 'QUERY', array()), $this->_additionalQueryParams, false);

		// BODY
		$body = $this->getBodySrc();
		$this->_body = $this->_initParam($body, ApiUtils::get($requestInput, 'BODY', array()), $this->_additionalBodyParams, false);

		// URL
		$urlArgs = $this->getArgsSrc();
		$this->_url = $this->_initParam($urlArgs, ApiUtils::get($requestInput, 'URL', array()));

		$this->_input = array_merge(array(), $this->_input, $this->_query, $this->_url, $this->_body);
	}

	function getHeadersSrc () {
		if (!is_null($this->_headersSource)) {
			return $this->_headersSource;
		}
		$this->_headersSource = $this->api->getLaunchParam('input/headers');
		return $this->_headersSource;
	}

	function getBodySrc () {
		if (!is_null($this->_bodySource)) {
			return $this->_bodySource;
		}
		$body = $this->api->getLaunchParam('input/body');
		if (is_string($body)) {
			$body = $this->api->filter->apply($body, 'parse_'.$this->getFormat(), array(), null, 'input', 'Invalid input format', 400);
		}
		$this->_bodySource = is_array($body) ? $body : array();
		return $this->_bodySource;
	}

	function getQuerySrc () {
		if (!is_null($this->_querySource)) {
			return $this->_querySource;
		}
		$query = $this->api->getLaunchParam('input/query');
		if (is_string($query)) {
			parse_str($query, $query);
		}
		$urlQuery = array();
		if ($this->api->getLaunchParam('search')) {
			parse_str($this->api->getLaunchParam('search'), $urlQuery);
		}
		$this->_querySource = is_array($query) && $query ? array_replace_recursive($urlQuery, $query) : $urlQuery;
		return $this->_querySource;
	}

	function getArgsSrc () {
		if (!is_null($this->_urlSource)) {
			return $this->_urlSource;
		}
		$this->_urlSource = $this->api->getLaunchParam('input/args');
		return $this->_urlSource;
	}


	public function getFormat () {
		if (!is_null($this->_format)) {
			return $this->_format;
		}

		$format = null;

		$contentType = ApiUtils::get($this->_headers, 'Content-Type');
		$contentType = trim($contentType);
		$contentType = preg_replace('/;.+/', '', $contentType);

		if ($contentType) {
			foreach ($this->api->formats as $_format => $data) {
				$mimes = $data['inputMimes'];
				if ($format) {
					break;
				}

				$mimes = is_array($mimes) ? $mimes : array($mimes);

				foreach ($mimes as $mime) {
					if ($contentType === $mime) {
						$format = $_format;
						break;
					}
				}
			}
		}

		$this->_format = $format ? $format : self::DEFAULT_FORMAT;
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

		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'QUERY', array()), $this->_query);
		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'BODY',  array()), $this->_body);
		$this->_applyAfterFiltersToParam(ApiUtils::get($requestInput, 'URL',   array()), $this->_url);
	}


	function body ($name = null, $default = null) {
		return ApiUtils::getArr($this->_body, $name, $default);
	}


	function url ($name = null, $default = null) {
		return ApiUtils::getArr($this->_url, $name, $default);
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

		return array('data' => $data, 'source' => $source);
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
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'URL', array()), $this->_url);
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'BODY', array()), $this->_body);
		$valid *= $this->_checkParam(ApiUtils::get($requestInput, 'QUERY', array()), $this->_query);
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