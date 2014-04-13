<?php



class ApiResponse extends ApiComponent {

	const COMPRESSING = true;

	const VIRTUAL_STATUS = 200;

	const DEFAULT_STATUS = 200;

	const RESPONSE_TYPE_ONE = 'one';

	const RESPONSE_TYPE_MANY = 'many';

	const DEFAULT_FORMAT  = 'json';

	protected $_data = array();

	protected $_meta = array();

	protected $_status = null;

	private $_virtualStatus = false;

	private $_response;

	private $_type;

	private $_limit = 1;

	private $_offset = 0;

	private $_fields = array();

	private $_responseOutput = array();

	private $_headers = array();

	private $_compiled = null;

	private $_encoding = null;
	private $_mime = null;
	private $_format = null;

	public function beforeLaunch () {
		parent::beforeLaunch();

		$this->_response = $this->api->getSpec('response');
		$this->_responseOutput = ApiUtils::get($this->_response, 'output', array());
		$this->_type = ApiUtils::get($this->_response, 'type', self::RESPONSE_TYPE_ONE);
		$this->_limit = ApiUtils::get($this->_response, 'limit', 1);
		$this->_fields = array_keys(ApiUtils::get($this->_responseOutput, 'data', array()));
		$this->_offset = $this->api->request->query('offset', 0);

		$_limit = $this->api->request->query('limit', $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;

		$this->_virtualStatus = (bool) $this->api->request->query('_virtual', false);
	}


	public function compile () {
		if (!is_null($this->_compiled)) {
			return $this->_compiled;
		}

		$response = array(
			'status' => self::DEFAULT_STATUS,
			'message'=> '',
			'data' => array()
		);

		if ($this->api->valid() && $this->_data) {
			$response["data"] = $this->prepareResponse($this->_data, 'data');
		}

		if ($this->_meta) {
			$response["meta"] = $this->prepareResponse($this->_meta, 'meta');
		}

		$status = $this->status();
		if ($this->api->valid()) {
			$status = $this->api->context->prepareResponseStatusByMethod($status, $response, $this->api->getParam('method'));
			if ($status >= 500) {
				$this->api->error(null, $status);
			}
			$this->status($status);
		}

		$errors = $this->api->getErrors();
		if ($errors) {
			$response['errors'] = $errors;
		}

		if ($this->_type == self::RESPONSE_TYPE_MANY) {
			$response["meta"]['count']  = count($response["data"]);
			$response["meta"]['limit']  = $this->_limit;
			$response["meta"]['offset'] = $this->_offset;
		}

		if ($this->api->valid()) {
			$response['success'] = true;
		} else {
			$response['success'] = false;
			$response['data'] = array();
		}

		// DEBUG DATA (only for development and testing mode)
		if (Api::DEBUG_MODE) {
			$response["debug"] = array(
				'url/pathname' => $this->api->getParam('url/pathname'),
				'method' => $this->api->getParam('method'),
				'time/script' => 0,
				'time/action' => $this->api->getParam('time/action'),
				'time/compile' => 0,
				'memoryPeak' => ApiUtils::formatBytes(memory_get_peak_usage()),
				'controller' => get_class($this->api->context),
				'methodName' => $this->api->getParam('actionToCall'),
				'action' => $this->api->getParam('action'),
				'db' => null,
				'stackTrace' => $this->api->getStackTrace(),
				'input' => array(
					'headers' => array(
						'raw' => $this->api->getParam('input/headers'),
						'parsed' => array (
							'encoding' => $this->getEncoding(),
							'language' => $this->api->request->getLanguage(),
							'inputFormat' => $this->api->request->getFormat(),
							'outputFormat' => $this->getFormat(),
							'outputMime' => $this->getMime(),
						)
					),
					"query"  => $this->api->request->query(),
					"args"    => $this->api->request->arg(),
					"body"   => $this->api->request->body(),
					"body:raw" => INPUT_DATA
				),
				"api" => $this->api->getSpec()
			);

			if ($this->api->context instanceof IApiDebugStatistic) {
				$response['debug'] = array_merge($response['debug'], $this->api->context->debugStatistic());
			}
		}

		$http_code = $this->status();

		$response['status'] = $http_code;
		$response['message'] = ApiUtils::getMessageByCode($http_code);

		$public_http_code = $this->_virtualStatus && $http_code >= 400 ? self::VIRTUAL_STATUS : $http_code;

		$this->setHeader('Content-Type', $this->getMime());

		$this->_compiled = array(
			'response' => $response,
			'status' => $public_http_code,
			'headers' => $this->getHeaders()
		);

		return $this->_compiled;
	}


	public function setHeader ($name, $value) {
		$this->_headers[$name] = $value;
	}


	public function removeHeader ($name) {
		unset($this->_headers[$name]);
	}


	public function getHeaders () {
		return $this->_headers;
	}


	public function getHeader ($name, $default = null) {
		return ApiUtils::get($this->_headers, $name, $default);
	}


	public function send ($compress = self::COMPRESSING) {

		$_response = $this->compile();
		$response = $_response['response'];

		$headers = $_response['headers'];
		$status = $_response['status'];

		header('HTTP/1.1: '.$status);
		header('Status: '.$status);
		foreach ($headers as $headerName => $headerValue) {
			header($headerName.': '.$headerValue);
		}

		if (isset($response['debug'])) {
			$nowTimestamp = gettimeofday(true);
			$startTimestamp = $this->api->getParam('timer/launch');
			$response['debug']['time/compile'] = $nowTimestamp - $startTimestamp;
			if (defined('START_TIMESTAMP')) {
				$response['debug']['time/script'] = $nowTimestamp - START_TIMESTAMP;
			}
			$response['debug']['memoryPeak'] = ApiUtils::formatBytes(memory_get_peak_usage(true));

		}

		$response = (string) $this->api->filter->apply($response, 'to_'.$this->getFormat());

		if ($compress) {
			$zlibOc = @ini_get('zlib.output_compression');
			$compressing = self::COMPRESSING && !$zlibOc && extension_loaded('zlib') && ApiUtils::get($this->getEncoding(), 'gzip', false);

			if (!$zlibOc && !$compressing) {
				header('Content-Length: '.strlen($response));
			} else {
				if ($compressing) {
					ob_start('ob_gzhandler');
				}
			}
		} else {
			header('Content-Length: '.strlen($response));
		}

		exit($response);
	}


	function status ($code = null) {
		if (!is_null($code)) {
			if (!is_numeric($code)) {
				trigger_error('Status code "'.$code.'" must be numeric type!', E_USER_ERROR);
			}
			$this->_status = $code;
		}

		return $this->_status ? $this->_status : static::DEFAULT_STATUS;
	}


	function data ($name = null, $value = null) {
		if (!is_null($name)) {

			if (is_object($name)) {
				$name = (array) $name;
			} else {
				if (!is_array($name) && (is_string($name) || is_numeric($name))) {
					$arr = array();
					$arr[$name] = $value;
					$name = $arr;
				}
			}

			if (is_array($name)) {
				foreach ($name as $n => $v) {
					$this->_data[$n] = $v;
				}
			} else {
				trigger_error("invalid meta format", E_USER_WARNING);
			}
		}

		return $this->_data;
	}


	function meta ($name = null, $value = null) {
		if (!is_null($name)) {
			if (is_object($name)) {
				$name = (array) $name;
			} else {
				if (!is_array($name) && (is_string($name) || is_numeric($name))) {
					$arr = array();
					$arr[$name] = $value;
					$name = $arr;
				}
			}
			if (is_array($name)) {
				foreach ($name as $n => $v) {
					$this->_meta[$n] = $v;
				}
			} else {
				trigger_error("invalid meta format", E_USER_WARNING);
			}
		}

		return $this->_meta;
	}


	private function _prepareData (&$_data, $data, $param, $strict = true) {
		$name = $param["name"];
		if (isset($data[$name])) {
			$_data[$name] = $this->api->context->toType($data[$name], $param["type"]);
		} else {
			if ($strict) {
				trigger_error("Api '".$this->api->getSpec('name')."': invalid response. '".$name."' is undefined!");
			}
		}
	}

	function valid () {
		if ($this->status() >= 400) {
			return false;
		}
		return parent::valid();
	}


	function prepareResponse ($data, $keyName) {
		$_data = array();

		if ($this->_type == static::RESPONSE_TYPE_ONE) {
			if (isset($data[0]) && is_array($data[0])) {
				$data = $data[0];
			}
			if (empty($data)) {
				return array();
			} else {
				if (!empty($this->_responseOutput[$keyName])) {
					foreach ($this->_responseOutput[$keyName] as $param) {
						$this->_prepareData($_data, $data, $param, true);
					}
				}
			}
		} else {
			if ($this->_type == static::RESPONSE_TYPE_MANY) {
				if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
					$data = array($data);
				}
				if (!empty($this->_responseOutput[$keyName])) {
					foreach ($data as $k => $_d) {
						$_data[$k] = array();
						foreach ($this->_responseOutput[$keyName] as $param) {
							$this->_prepareData($_data[$k], $_d, $param, true);
						}
						if (empty ($_data[$k])) {
							unset($_data[$k]);
						}
					}
				}
				if ($this->_limit) {
					$_data = array_slice($_data, 0, $this->_limit);
				}
			}
		}

		return $_data;
	}

	function getEncoding () {
		if (is_null($this->_encoding)) {
			$this->_encoding = ApiUtils::parseQualityString($this->api->request->header('Accept-Encoding'));
		}
		return $this->_encoding;
	}

	function getMime () {
		if (is_null($this->_mime)) {
			$this->_mime = $this->api->formats[$this->getFormat()]['outputMime'];
		}
		return $this->_mime;
	}

	function getFormat () {
		if (is_null($this->_format)) {
			$accept = ApiUtils::parseQualityString($this->api->request->header('Accept', ''));
			$format = ApiUtils::getFileFormatByFileExt(parse_url($this->api->getParam('url/pathname'), PHP_URL_PATH), $this->api->formats, null);

			if (!is_null($format)) {
				$format = ApiUtils::getFormatByHeadersAccept($accept, $this->api->formats, null);
			}

			if (is_null($format)) {
				$format = self::DEFAULT_FORMAT;
			}

			$this->_format = $format;
		}
		return $this->_format;
	}
}