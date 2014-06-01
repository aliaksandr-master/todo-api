<?php


namespace Intercessor;

class Response extends ComponentAbstract {

	const TYPE_ONE = 'one';

	const TYPE_MANY = 'many';

	protected $_data = array();

	protected $_meta = array();

	protected $_status = null;

	private $_freeze = false;

	private $_headers = array();

	private $_compiled = null;


	public function success () {
		return Utils::get($this->getStatusInfo($this->status()), 'success', false);
	}

	private function getStatusInfo ($status) {
		return Utils::get($this->env->statuses, $status, array());
	}


	private function _compile ($compileOnce = false) {
		if (!is_null($this->_compiled) && ($this->_freeze || $compileOnce)) {
			return $this->_compiled;
		}
		$responseCompileTime = gettimeofday(true);

		$this->_setErrorHandler();
		$this->publish('beforeCompile');

		if ($this->valid($this->request, $this)) {
			$this->_data = $this->prepareResponse($this->_data, 'data');
		} else {
			$this->clear();
		}

		if ($this->valid($this->request, $this)) {
			$this->_meta = $this->prepareResponse($this->_meta, 'meta');

			if ($this->request->responseType() == self::TYPE_MANY) {
				$this->_meta['count'] = count($this->_data);
				$this->_meta['limit'] = $this->request->dataLimit();
				$this->_meta['offset'] = $this->request->dataOffset();
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

		$debug = array();
		if ($this->env->debug) {
			$debug = array(
				'uri'        => $this->request->uri(),
				'method'     => $this->request->httpMethod(),
				'timers'     => $this->env->timers,
				'memory'     => array(),
				'controller' => $this->request->spec('controller', $this->env->default_controller),
				'action'     => $this->request->action(),
				'db'         => null,
				'input'      => array(
					'headers' => array(
						'raw'    => $this->request->header(),
						'parsed' => array(
							'encoding'     => $this->request->acceptEncoding(),
							'language'     => $this->request->language(),
							'inputFormat'  => $this->request->inputFormat(),
							'outputFormat' => $this->request->outputFormat(),
							'outputMime'   => $this->request->outputMime(),
						)
					),
					"query"   => $this->request->query(),
					"params"  => $this->request->param(),
					"body"    => $this->request->body()
				),
				"spec"       => $this->request->spec()
			);
			$debug['memory']['peak'] = memory_get_peak_usage(true);
		}

		$status = $this->status();

		$virtualFailureResponse = $this->request->query($this->env->virtual_failure_query_param, false);

		$virtualStatusInfo = $this->getStatusInfo($status);

		$virtualSuccess = Utils::get($virtualStatusInfo, 'success', false);
		if ($virtualFailureResponse && !$virtualSuccess) {
			$httpStatusCode = Utils::get($this->getStatusInfo($this->env->virtual_failure_response_status), 'code', 500);
		} else {
			$httpStatusCode = Utils::get($virtualStatusInfo, 'code', false);
		}

		$this->setHeader('HTTP/1.1', $httpStatusCode);
		$this->setHeader('Status', $httpStatusCode);

		$this->setHeader('Content-Type', $this->request->outputMime());

		$response = array(
			'success' => $virtualSuccess,
			'code' => null,
			'data'    => $this->data(),
			'meta'    => $this->meta(),
			'errors'  => $this->getErrors(),
			'debug'   => $debug
		);

		$response = array_replace_recursive($response, $virtualStatusInfo);

		$this->_compiled = array(
			'response' => $response,
			'status'   => $httpStatusCode,
			'headers'  => $this->getHeaders()
		);

		$this->_compiled['response'] = $this->request->controller()->intercessorPrepareOutput($this->_compiled['response'], $this->env->debug);


		foreach ($this->env->optional_response_keys as $key) {
			if (empty($this->_compiled['response'][$key])) {
				unset($this->_compiled['response'][$key]);
			}
		}

		$this->publish('afterCompile');

		if (!empty($this->_compiled['response']['debug'])) {
			$this->_compiled['response']['debug']['stackTrace'] = $this->env->getStackTrace();
			$this->_compiled['response']['debug']['timers']['response_compile'] = gettimeofday(true) - $responseCompileTime;
		}
		$this->_restoreErrorHandler();
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


	public function header ($name, $default = null) {
		return Utils::get($this->_headers, $name, $default);
	}


	public function clear ($data = true, $meta = true) {
		if ($data) {
			$this->_data = array();
		}
		if ($meta) {
			$this->_meta = array();
		}
	}


	public function freeze () {
		$this->_freeze = true;
	}


	public function sendHeaders () {
		$this->_compile(true);
		foreach ($this->_compiled['headers'] as $headerName => $headerValue) {
			if (!is_null($headerValue)) {
				header($headerName.': '.$headerValue);
			}
		}
	}


	public function output ($name = null, $default = null) {
		$this->_compile(true);

		return Utils::getArr($this->_compiled['response'], $name, $default);
	}


	public function toString () {
		$this->_compile(true);

		return $this->request->controller()->intercessorFilterData($this->_compiled['response'], 'to_'.$this->request->outputFormat());
	}


	public function response () {
		$this->_compile(true);

		return $this->_compiled['response'];
	}


	function status ($status = null) {
		if (!is_null($status)) {
			if (!$this->_freeze || is_null($this->_status)) {
				if ($this->env->debug) {
					$code = Utils::get(Utils::get($this->env->statuses, $status), 'code', 500);
					if (!($code >= 500 && $code < 600)) {
						$avlStatuses = Utils::get($this->request->spec('response', array()), 'statuses', null);
						if (is_null($avlStatuses)) {
							$this->fatalError('Empty statuses in spec'.$this->request->spec('name'));
						} else if (!in_array($status, $avlStatuses)) {
							$this->fatalError('undefined status "'.$status.'"');
						}
					}
				}
				$this->_status = $status;
			}
			return $this;
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
		} else if ($strict) {
			trigger_error("Intercessor '".$this->request->spec('name')."': invalid response. '".$name."' is undefined!", E_USER_NOTICE);
		}
	}


	protected function prepareResponse ($data, $keyName) {
		$_data = array();

		$outputSpec = Utils::get($this->request->spec('response'), 'output', array());

		if ($this->request->responseType() == static::TYPE_ONE) {
			if (isset($data[0]) && is_array($data[0])) {
				$data = $data[0];
			}
			if (empty($data)) {
				return array();
			} else {
				if (!empty($outputSpec[$keyName])) {
					foreach ($outputSpec[$keyName] as $param) {
						$this->_prepareData($_data, $data, $param, true);
					}
				}
			}
		} else {
			if ($this->request->responseType() == static::TYPE_MANY) {
				if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
					$data = array($data);
				}
				if (!empty($outputSpec[$keyName])) {
					foreach ($data as $k => $_d) {
						$_data[$k] = array();
						foreach ($outputSpec[$keyName] as $param) {
							$this->_prepareData($_data[$k], $_d, $param, true);
						}
						if (empty ($_data[$k])) {
							unset($_data[$k]);
						}
					}
				}
				$_data = array_slice($_data, 0, $this->request->dataLimit());
			}
		}

		return $_data;
	}
}