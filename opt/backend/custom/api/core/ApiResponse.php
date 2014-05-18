<?php



class ApiResponse extends ApiAbstractComponent {

	const VIRTUAL_STATUS = 200;

	const DEFAULT_STATUS = 200;

	const RESPONSE_TYPE_ONE = 'one';

	const RESPONSE_TYPE_MANY = 'many';

	const DEFAULT_FORMAT = 'json';

	protected $_data = array();

	protected $_optionalResponseKeys = array(
		'errors',
		'debug',
		'meta',
		'data'
	);

	protected $_meta = array();

	protected $_status = null;

	private $_responseSpec;

	private $_responseOutputSpec = array();

	private $_type;

	private $_freeze = false;

	private $_limit = 1;

	private $_offset = 0;

	private $_headers = array();

	private $_compiled = null;

	private $_encoding = null;

	private $_mime = null;

	private $_format = null;


	public function _configure ($name, $method, $uri, array $params) {
		$this->_responseSpec = $this->api->getSpec('response');
		$this->_responseOutputSpec = ApiUtils::get($this->_responseSpec, 'output', array());

		$this->_limit = ApiUtils::get($this->_responseOutputSpec, 'limit', null);

		$this->_type = self::RESPONSE_TYPE_MANY;

		if (is_null($this->_limit)) {
			$this->_type = self::RESPONSE_TYPE_ONE;
			$this->_limit = 1;
		}

		$this->_offset = $this->api->request->query(ApiRequest::OFFSET_PARAM_NAME, 0);

		$_limit = $this->api->request->query(ApiRequest::LIMIT_PARAM_NAME, $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;
	}


	function beforeActionCall () {
	}


	function getMessageByStatus ($status) {
		$statusObj = ApiUtils::get($this->api->statuses, $status, array());

		return ApiUtils::get($statusObj, 'message', null);
	}


	function getCodeByStatus ($status) {
		$statusObj = ApiUtils::get($this->api->statuses, $status, array());

		return ApiUtils::get($statusObj, 'code', null);
	}


	function getSuccessByStatus ($status) {
		$statusObj = ApiUtils::get($this->api->statuses, $status, array());

		return ApiUtils::get($statusObj, 'success', null);
	}


	public function compile ($compileOnce = false) {
		if (!is_null($this->_compiled) && ($this->_freeze || $compileOnce)) {
			return $this->_compiled;
		}

		$debug = array();

		if ($this->api->valid()) {
			$this->_data = $this->prepareResponse($this->_data, 'data');
		} else {
			$this->clear();
		}

		if ($this->api->valid()) {
			$this->_meta = $this->prepareResponse($this->_meta, 'meta');

			if ($this->_type == self::RESPONSE_TYPE_MANY) {
				$this->_meta['count'] = count($this->_data);
				$this->_meta['limit'] = $this->_limit;
				$this->_meta['offset'] = $this->_offset;
			}
		} else {
			$this->clear();
		}

		if ($this->api->context) {
			if ($this->api->valid()) {
				$this->api->context->prepareSuccess();
			}

			if (!$this->api->valid()) {
				$this->clear();
				$this->api->context->prepareError();
			}
		}

		$this->setHeader('Content-Type', $this->getMime());

		// DEBUG DATA (only for development and testing mode)
		if ($this->api->debugMode) {
			$nowTimestamp = gettimeofday(true);
			$debug = array(
				'url/pathname' => $this->api->request->uriPathname,
				'method'       => $this->api->request->method,
				'timers'       => array(
					'script' => defined('START_TIMESTAMP') ? $nowTimestamp - START_TIMESTAMP : 0,
					'action' => $this->api->timers['action'],
					'launch' => $nowTimestamp - $this->api->timers['launch'],
				),
				'memory' => array(),
				'controller'   => $this->getSpec('controller', 'NOT FOUND'),
				'action'       => $this->api->request->action,
				'db'           => null,
				'stackTrace'   => $this->api->getStackTrace(),
				'input'        => array(
					'headers'  => array(
						'raw'    => $this->api->request->getHeadersSrc(),
						'parsed' => array(
							'encoding'     => $this->getEncoding(),
							'language'     => $this->api->request->getLanguage(),
							'inputFormat'  => $this->api->request->getFormat(),
							'outputFormat' => $this->getFormat(),
							'outputMime'   => $this->getMime(),
						)
					),
					"query"    => $this->api->request->query(),
					"args"     => $this->api->request->param(),
					"body"     => $this->api->request->body(),
					"body:raw" => $this->api->request->getBodySrc()
				),
				"api"          => $this->api->getSpec()
			);

			if ($this->api->context) {
				$debug = array_replace_recursive($debug, $this->api->context->statistic());
			}

			$debug['memory']['usage'] = ApiUtils::formatBytes(memory_get_usage(true));
			$debug['memory']['peak'] = ApiUtils::formatBytes(memory_get_peak_usage(true));
		}

		$status = $this->status();
		$code = $this->getCodeByStatus($status);
		$this->_compiled = array(
			'response' => array(
				'status'  => $code,
				'success' => $this->getSuccessByStatus($status),
				'message' => $this->getMessageByStatus($status),
				'data'    => $this->data(),
				'meta'    => $this->meta(),
				'errors'  => $this->api->getErrors(),
				'debug'   => $debug
			),
			'status'   => $this->getCodeByStatus($this->api->request->query(ApiRequest::VIRTUAL_PARAM_NAME, false) && $code >= 400 ? self::VIRTUAL_STATUS : $code),
			'headers'  => $this->getHeaders()
		);

		foreach ($this->_optionalResponseKeys as $key) {
			if (empty($this->_compiled['response'][$key])) {
				unset($this->_compiled['response'][$key]);
			}
		}

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


	public function clear () {
		$this->_data = array();
		$this->_meta = array();
	}


	public function freeze () {
		$this->_freeze = true;
	}

	private function filter__to_json ($data, array $params = array()) {
		return json_encode($data);
	}

	private function filter__to_jsonp ($data, array $params = array()) {
		return $params[0].'('.$this->filter__to_json($data).');';
	}


	public function send ($compress = false) {
		$this->compile(true);

		header('HTTP/1.1: '.$this->_compiled['status']);
		header('Status: '.$this->_compiled['status']);
		foreach ($this->_compiled['headers'] as $headerName => $headerValue) {
			if (!is_null($headerValue)) {
				header($headerName.': '.$headerValue);
			}
		}

		$this->_compiled['response'] = (string) $this->{'filter__to_'.$this->getFormat()}($this->_compiled['response']);

		if ($compress) {
			$zlibOc = @ini_get('zlib.output_compression');
			$compressing = !$zlibOc && extension_loaded('zlib') && ApiUtils::get($this->getEncoding(), 'gzip', false);

			if (!$zlibOc && !$compressing) {
				header('Content-Length: '.strlen($this->_compiled['response']));
			} else {
				if ($compressing) {
					ob_start('ob_gzhandler');
				}
			}
		} else {
			header('Content-Length: '.strlen($this->_compiled['response']));
		}

		exit($this->_compiled['response']);
	}


	public function response ($send = true) {
		$_response = $this->compile(true);

		return $_response['response'];
	}


	function status ($code = null) {
		if (!is_null($code)) {
			if (!is_numeric($code)) {
				trigger_error('Status code "'.$code.'" must be numeric type!', E_USER_ERROR);
			}
			if (!$this->_freeze || is_null($this->_status)) {
				$this->_status = $code;
			}
		}

		return $this->_status ? $this->_status : static::DEFAULT_STATUS;
	}


	function data ($name = null, $value = null) {
		if ($this->_freeze) {
			return $this->_data;
		}
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
		if ($this->_freeze) {
			return $this->_meta;
		}
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
			$_data[$name] = $this->api->context->filterData($data[$name], 'to_type', array($param["type"]));
		} else {
			if ($strict) {
				trigger_error("Api '".$this->api->getSpec('name')."': invalid response. '".$name."' is undefined!");
			}
		}
	}


	protected function prepareResponse ($data, $keyName) {
		$_data = array();

		if ($this->_type == static::RESPONSE_TYPE_ONE) {
			if (isset($data[0]) && is_array($data[0])) {
				$data = $data[0];
			}
			if (empty($data)) {
				return array();
			} else {
				if (!empty($this->_responseOutputSpec[$keyName])) {
					foreach ($this->_responseOutputSpec[$keyName] as $param) {
						$this->_prepareData($_data, $data, $param, true);
					}
				}
			}
		} else {
			if ($this->_type == static::RESPONSE_TYPE_MANY) {
				if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
					$data = array($data);
				}
				if (!empty($this->_responseOutputSpec[$keyName])) {
					foreach ($data as $k => $_d) {
						$_data[$k] = array();
						foreach ($this->_responseOutputSpec[$keyName] as $param) {
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


	public function getEncoding () {
		if (is_null($this->_encoding)) {
			$this->_encoding = ApiUtils::parseQualityString($this->api->request->header('Accept-Encoding'));
		}

		return $this->_encoding;
	}


	public function getMime () {
		if (is_null($this->_mime)) {
			$this->_mime = $this->api->mimes[$this->getFormat()][0];
		}

		return $this->_mime;
	}


	public function getFormat () {
		if (is_null($this->_format)) {
			$accept = ApiUtils::parseQualityString($this->api->request->header('Accept', ''));
			$format = ApiUtils::getFileFormatByFileExt(parse_url($this->api->request->uriPathname, PHP_URL_PATH), $this->api->mimes, null);

			if (!is_null($format)) {
				$format = ApiUtils::getFormatByHeadersAccept($accept, $this->api->mimes, null);
			}

			if (is_null($format)) {
				$format = self::DEFAULT_FORMAT;
			}

			$this->_format = $format;
		}

		return $this->_format;
	}
}