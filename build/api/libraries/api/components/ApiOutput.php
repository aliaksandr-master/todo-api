<?php



class ApiOutput extends ApiComponent {

	const COMPRESSING = true;

	const VIRTUAL_STATUS = 200;

	const DEFAULT_STATUS = 200;

	const RESPONSE_TYPE_ONE = 'one';

	const RESPONSE_TYPE_MANY = 'many';

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


	public function init () {
		parent::init();

		$this->_response = $this->api->getSpec('response');
		$this->_responseOutput = ApiUtils::get($this->_response, 'output', array());
		$this->_type = ApiUtils::get($this->_response, 'type', self::RESPONSE_TYPE_ONE);
		$this->_limit = ApiUtils::get($this->_response, 'limit', 1);
		$this->_fields = array_keys(ApiUtils::get($this->_responseOutput, 'data', array()));
		$this->_offset = $this->api->input->query('offset', 0);

		$_limit = $this->api->input->query('limit', $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;

		$this->_virtualStatus = (bool) $this->api->input->query('_virtual', false);
	}


	public function compile () {
		if (!is_null($this->_compiled)) {
			return $this->_compiled;
		}

		$response = array(
			'status' => self::DEFAULT_STATUS,
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
			$status = $this->api->context->prepareStatusByMethod($status, $response, $this->api->getLaunchParam('method'));
			if ($status >= 500) {
				$this->api->error('Incorrect api implementation', $status);
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
				'effective_uri' => $this->api->getLaunchParam('uri'),
				'method' => $this->api->getLaunchParam('method'),
				'time' => 0,
//				'params' => $this->api->getLaunchParams(),
				'input' => array(
					'headers' => array(
						'raw' => $this->api->getLaunchParam('input/headers'),
						'parsed' => array (
							'accept' => $this->api->server->accept,
							'encoding' => $this->api->server->encoding,
							'language' => $this->api->server->language,
							'inputFormat' => $this->api->server->inputFormat,
							'outputFormat' => $this->api->server->outputFormat,
							'outputMime' => $this->api->server->outputMime,
						)
					),
					"query"  => $this->api->input->query(),
					"args"    => $this->api->input->url(),
					"body"   => $this->api->input->body(),
					"body:raw" => INPUT_DATA
				),
				"api" => $this->api->getSpec()
			);
		}

		$http_code = $this->status();

		$response['status'] = $http_code;

		$public_http_code = $this->_virtualStatus && $http_code >= 400 ? self::VIRTUAL_STATUS : $http_code;

		$this->setHeader('Content-Type', $this->api->server->outputMime);

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
			$startTimestamp = $this->api->getLaunchParam('debug/start_timestamp');
			$precession = 1000;
			$response['debug']['time'] = (round(($nowTimestamp - $startTimestamp) * $precession) / $precession);
		}

		$response = (string) $this->api->filter->apply($response, 'to_'.$this->api->server->outputFormat);

		if ($compress) {
			$zlibOc = @ini_get('zlib.output_compression');
			$compressing = self::COMPRESSING && !$zlibOc && extension_loaded('zlib') && ApiUtils::get($this->api->server->encoding, 'gzip', false);

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

		return $this->_status ? $this->_status : ApiOutput::DEFAULT_STATUS;
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


	function prepareResponse ($data, $keyName) {
		$_data = array();

		if ($this->_type == ApiOutput::RESPONSE_TYPE_ONE) {
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
			if ($this->_type == ApiOutput::RESPONSE_TYPE_MANY) {
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
}