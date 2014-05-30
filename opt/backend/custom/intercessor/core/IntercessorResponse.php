<?php



class IntercessorResponse extends IntercessorAbstractComponent {

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
		$this->_responseSpec = $this->kernel->getSpec('response');
		$this->_responseOutputSpec = IntercessorUtils::get($this->_responseSpec, 'output', array());

		$this->_limit = IntercessorUtils::get($this->_responseOutputSpec, 'limit', null);

		$this->_type = self::RESPONSE_TYPE_MANY;

		if (is_null($this->_limit)) {
			$this->_type = self::RESPONSE_TYPE_ONE;
			$this->_limit = 1;
		}

		$this->_offset = $this->kernel->request->query(IntercessorRequest::OFFSET_PARAM_NAME, 0);

		$_limit = $this->kernel->request->query(IntercessorRequest::LIMIT_PARAM_NAME, $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;
	}


	function getMessageByStatus ($status) {
		$statusObj = IntercessorUtils::get($this->kernel->loader->statuses, $status, array());

		return IntercessorUtils::get($statusObj, 'message', null);
	}


	function getCodeByStatus ($status) {
		$statusObj = IntercessorUtils::get($this->kernel->loader->statuses, $status, array());

		return IntercessorUtils::get($statusObj, 'code', null);
	}


	function getSuccessByStatus ($status) {
		$statusObj = IntercessorUtils::get($this->kernel->loader->statuses, $status, array());

		return IntercessorUtils::get($statusObj, 'success', null);
	}


	public function compile ($compileOnce = false) {
		if (!is_null($this->_compiled) && ($this->_freeze || $compileOnce)) {
			return $this->_compiled;
		}

		$debug = array();

		if ($this->kernel->valid()) {
			$this->_data = $this->prepareResponse($this->_data, 'data');
		} else {
			$this->clear();
		}

		if ($this->kernel->valid()) {
			$this->_meta = $this->prepareResponse($this->_meta, 'meta');

			if ($this->_type == self::RESPONSE_TYPE_MANY) {
				$this->_meta['count'] = count($this->_data);
				$this->_meta['limit'] = $this->_limit;
				$this->_meta['offset'] = $this->_offset;
			}
		} else {
			$this->clear();
		}

		if ($this->kernel->context) {
			if ($this->kernel->valid()) {
				$this->kernel->context->prepareSuccess();
			}

			if (!$this->kernel->valid()) {
				$this->clear();
				$this->kernel->context->prepareError();
			}
		}

		$this->setHeader('Content-Type', $this->getMime());

		// DEBUG DATA (only for development and testing mode)
		if ($this->kernel->loader->debug) {
			$nowTimestamp = gettimeofday(true);
			$debug = array(
				'url/pathname' => $this->kernel->request->uriPathname,
				'method'       => $this->kernel->request->method,
				'timers'       => array(
					'script' => defined('START_TIMESTAMP') ? $nowTimestamp - START_TIMESTAMP : 0,
					'action' => $this->kernel->timers['action'],
					'launch' => $nowTimestamp - $this->kernel->timers['launch'],
				),
				'memory' => array(),
				'controller'   => $this->getSpec('controller', 'NOT FOUND'),
				'action'       => $this->kernel->request->action,
				'db'           => null,
				'stackTrace'   => $this->kernel->getStackTrace(),
				'input'        => array(
					'headers'  => array(
						'raw'    => $this->kernel->request->getHeadersSrc(),
						'parsed' => array(
							'encoding'     => $this->getEncoding(),
							'language'     => $this->kernel->request->getLanguage(),
							'inputFormat'  => $this->kernel->request->getFormat(),
							'outputFormat' => $this->getFormat(),
							'outputMime'   => $this->getMime(),
						)
					),
					"query"    => $this->kernel->request->query(),
					"args"     => $this->kernel->request->param(),
					"body"     => $this->kernel->request->body(),
					"body:raw" => $this->kernel->request->getBodySrc()
				),
				"kernel"          => $this->kernel->getSpec()
			);

			if ($this->kernel->context) {
				$debug = array_replace_recursive($debug, $this->kernel->context->statistic());
			}
			$debug['memory']['usage'] = IntercessorUtils::formatBytes(memory_get_usage(true) - START_MEMORY);
			$debug['memory']['peak'] = IntercessorUtils::formatBytes(memory_get_peak_usage(true));
		}

		$status = $this->status();

		$virtualFailureResponse = $this->kernel->request->query(IntercessorRequest::VIRTUAL_FAILURE_QUERY_PARAM, false);

		$virtualSuccess    = $this->getSuccessByStatus($status);
		$virtualStatusCode = $this->getCodeByStatus($status);
		$virtualStatusMsg  = $this->getMessageByStatus($status);
		$httpStatusCode    = $virtualFailureResponse && !$virtualSuccess ? $this->getCodeByStatus(self::VIRTUAL_STATUS) : $virtualStatusCode;

		$this->_compiled = array(
			'response' => array(
				'status'  => $virtualStatusCode,
				'success' => $virtualSuccess,
				'message' => $virtualStatusMsg,
				'data'    => $this->data(),
				'meta'    => $this->meta(),
				'errors'  => $this->kernel->error->get(),
				'debug'   => $debug
			),
			'status'   => $httpStatusCode,
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
		return IntercessorUtils::get($this->_headers, $name, $default);
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


	public function output ($headers = true, $compress = false) {
		$this->compile(true);

		if ($headers) {
			header('HTTP/1.1: '.$this->_compiled['status']);
			header('Status: '.$this->_compiled['status']);
			foreach ($this->_compiled['headers'] as $headerName => $headerValue) {
				if (!is_null($headerValue)) {
					header($headerName.': '.$headerValue);
				}
			}
		}

		$this->_compiled['output'] = (string) $this->{'filter__to_'.$this->getFormat()}($this->_compiled['response']);

		if ($headers) {
			if ($compress) {
				$zlibOc = @ini_get('zlib.output_compression');
				$compressing = !$zlibOc && extension_loaded('zlib') && IntercessorUtils::get($this->getEncoding(), 'gzip', false);

				if (!$zlibOc && !$compressing) {
					header('Content-Length: '.strlen($this->_compiled['output']));
				} else {
					if ($compressing) {
						ob_start('ob_gzhandler');
					}
				}
			} else {
				header('Content-Length: '.strlen($this->_compiled['response']));
			}
		}

		return $this->_compiled['output'];
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
			$_data[$name] = $this->kernel->context->filterData($data[$name], 'to_type', array($param["type"]));
		} else {
			if ($strict) {
				trigger_error("Intercessor '".$this->kernel->getSpec('name')."': invalid response. '".$name."' is undefined!");
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
			$this->_encoding = IntercessorUtils::parseQualityString($this->kernel->request->header('Accept-Encoding'));
		}

		return $this->_encoding;
	}


	public function getMime () {
		if (is_null($this->_mime)) {
			$this->_mime = $this->kernel->loader->mimes[$this->getFormat()][0];
		}

		return $this->_mime;
	}


	public function getFormat () {
		if (is_null($this->_format)) {
			$accept = IntercessorUtils::parseQualityString($this->kernel->request->header('Accept', ''));
			$format = IntercessorUtils::getFileFormatByFileExt(parse_url($this->kernel->request->uriPathname, PHP_URL_PATH), $this->kernel->loader->mimes, null);

			if (!is_null($format)) {
				$format = IntercessorUtils::getFormatByHeadersAccept($accept, $this->kernel->loader->mimes, null);
			}

			if (is_null($format)) {
				$format = self::DEFAULT_FORMAT;
			}

			$this->_format = $format;
		}

		return $this->_format;
	}
}