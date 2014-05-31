<?php


namespace Intercessor;


class Response extends ComponentAbstract {

	const TYPE_ONE = 'one';

	const TYPE_MANY = 'many';

	protected $_data = array();

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

	private $_mime = null;

	private $_format = null;


	public function _init (Environment &$env, Request &$request, Response &$response) {
		parent::_init($env, $request, $response);

		$this->subscribe($this->request, 'beforeRun', '_beforeRun');
	}

	protected  function _beforeRun () {
		$this->_responseSpec = $this->request->spec('response');
		$this->_responseOutputSpec = Utils::get($this->_responseSpec, 'output', array());

		$this->_limit = Utils::get($this->_responseOutputSpec, 'limit', null);

		$this->_type = self::TYPE_MANY;

		if (is_null($this->_limit)) {
			$this->_type = self::TYPE_ONE;
			$this->_limit = 1;
		}

		$this->_offset = $this->request->query($this->env->offset_query_param, 0);

		$_limit = $this->request->query($this->env->limit_query_param, $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;
	}



	public function success () {
		return $this->getSuccessByStatus($this->status());
	}



	private function getMessageByStatus ($status) {
		$statusObj = Utils::get($this->env->statuses, $status, array());
		return Utils::get($statusObj, 'message', null);
	}

	private function getCodeByStatus ($status) {
		$statusObj = Utils::get($this->env->statuses, $status, array());

		return Utils::get($statusObj, 'code', null);
	}
	private function getSuccessByStatus ($status) {
		$statusObj = Utils::get($this->env->statuses, $status, array());

		return Utils::get($statusObj, 'success', null);
	}


	public function compile ($compileOnce = false) {
		if (!is_null($this->_compiled) && ($this->_freeze || $compileOnce)) {
			return $this->_compiled;
		}

		if ($this->valid($this->request, $this)) {
			$this->_data = $this->prepareResponse($this->_data, 'data');
		} else {
			$this->clear();
		}

		if ($this->valid($this->request, $this)) {
			$this->_meta = $this->prepareResponse($this->_meta, 'meta');

			if ($this->_type == self::TYPE_MANY) {
				$this->_meta['count'] = count($this->_data);
				$this->_meta['limit'] = $this->_limit;
				$this->_meta['offset'] = $this->_offset;
			}
		} else {
			$this->clear();
		}

		if ($this->request->controller()) {
			if ($this->valid($this->request, $this)) {
				$this->request->controller()->intercessorPrepareSuccess($this->request, $this);
			}

			if (!$this->valid($this->request, $this)) {
				$this->clear();
				$this->request->controller()->intercessorPrepareError($this->request, $this);
			}
		}

		$this->setHeader('Content-Type', $this->mime());


		$debug = array();
		if ($this->env->debug) {
			$nowTimestamp = gettimeofday(true);
			$debug = array(
				'uri'    => $this->request->uri(),
				'method' => $this->request->httpMethod(),
				'timers' => $this->env->timers,
				'memory' => array(),
				'controller'   => $this->request->spec('controller', $this->env->default_controller),
				'action'       => $this->request->action(),
				'db'           => null,
				'stackTrace'   => $this->env->getStackTrace(),
				'input'        => array(
					'headers'  => array(
						'raw'    => $this->request->header(),
						'parsed' => array(
							'encoding'     => $this->request->acceptEncoding(),
							'language'     => $this->request->language(),
							'inputFormat'  => $this->request->format(),
							'outputFormat' => $this->format(),
							'outputMime'   => $this->mime(),
						)
					),
					"query"    => $this->request->query(),
					"args"     => $this->request->param(),
					"body"     => $this->request->body()
				),
				"spec"  => $this->request->spec()
			);
			$debug['memory']['peak']   = memory_get_peak_usage(true);
		}

		$status = $this->status();

		$virtualFailureResponse = $this->request->query($this->env->virtual_failure_query_param, false);

		$virtualSuccess    = $this->getSuccessByStatus($status);
		$virtualStatusCode = $this->getCodeByStatus($status);
		$virtualStatusMsg  = $this->getMessageByStatus($status);
		$httpStatusCode    = $virtualFailureResponse && !$virtualSuccess ? $this->getCodeByStatus($this->env->virtual_failure_response_status) : $virtualStatusCode;

		$this->setHeader('HTTP/1.1', $httpStatusCode);
		$this->setHeader('Status', $httpStatusCode);

		$this->_compiled = array(
			'response' => array(
				'status'  => $virtualStatusCode,
				'success' => $virtualSuccess,
				'message' => $virtualStatusMsg,
				'data'    => $this->data(),
				'meta'    => $this->meta(),
				'errors'  => $this->getErrors(),
				'debug'   => $debug
			),
			'status'   => $httpStatusCode,
			'headers'  => $this->getHeaders()
		);


		$this->_compiled['response'] = $this->request->controller()->intercessorPrepareOutput($this->_compiled['response'], $this->env->debug);

		foreach ($this->env->optional_response_keys as $key) {
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
		return Utils::get($this->_headers, $name, $default);
	}


	public function clear () {
		$this->_data = array();
		$this->_meta = array();
	}


	public function freeze () {
		$this->_freeze = true;
	}


	public function sendHeaders () {
		$this->compile(true);
		foreach ($this->_compiled['headers'] as $headerName => $headerValue) {
			if (!is_null($headerValue)) {
				header($headerName.': '.$headerValue);
			}
		}
	}

	public function output ($name = null, $default = null) {
		$this->compile(true);
		return Utils::getArr($this->_compiled, $name, $default);
	}

	public function toString () {
		$this->compile(true);
		return $this->request->controller()->intercessorFilterData($this->_compiled['response'], 'to_'.$this->format());
	}


	public function response () {
		$this->compile(true);

		return $this->_compiled['response'];
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

		return $this->_status ? $this->_status : $this->env->default_response_status;
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
			$_data[$name] = $this->request->controller()->intercessorFilterData($data[$name], 'to_type', array($param["type"]));
		} else {
			if ($strict) {
				trigger_error("Intercessor '".$this->request->spec('name')."': invalid response. '".$name."' is undefined!");
			}
		}
	}


	protected function prepareResponse ($data, $keyName) {
		$_data = array();

		if ($this->_type == static::TYPE_ONE) {
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
			if ($this->_type == static::TYPE_MANY) {
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


	public function mime () {
		if (is_null($this->_mime)) {
			$this->_mime = $this->env->mimes[$this->format()][0];
		}
		return $this->_mime;
	}


	public function format () {
		if (is_null($this->_format)) {
			$accept = Utils::parseQualityString($this->request->header('Accept', ''));
			$format = Utils::getFileFormatByFileExt($this->request->uri(PHP_URL_PATH), $this->env->mimes, null);

			if (!is_null($format)) {
				$format = Utils::getFormatByHeadersAccept($accept, $this->env->mimes, null);
			}

			if (is_null($format)) {
				$format = $this->env->default_response_format;
			}

			$this->_format = $format;
		}

		return $this->_format;
	}
}