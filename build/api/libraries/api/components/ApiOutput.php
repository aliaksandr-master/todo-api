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

	public function init () {
		parent::init();


		$this->_response = $this->api->get(Api::RESPONSE);
		$this->_responseOutput = ApiUtils::get($this->_response, 'output', array());
		$this->_type = ApiUtils::get($this->_response, 'type', self::RESPONSE_TYPE_ONE);
		$this->_limit = ApiUtils::get($this->_response, 'limit', 1);
		$this->_fields = array_keys(ApiUtils::get($this->_responseOutput, 'data', array()));
		$this->_offset = $this->api->input->query('offset', 0);

		$_limit  = $this->api->input->query('limit', $this->_limit);
		$this->_limit = $_limit < $this->_limit ? $_limit : $this->_limit;


		$this->_virtualStatus = (bool) $this->api->input->query('_virtual', false);
	}

	private $_compiled = null;

	public function compile () {
		if (!is_null($this->_compiled)) {
			return $this->_compiled;
		}

		$method  = $this->api->getLaunchParam('method');

		$response = array(
			'status' => $this->status(),
			'data' => $this->_data
		);

		if ($this->_meta) {
			$response['meta'] = $this->_meta;
		}

		$errors = $this->api->getErrors();
		if ($errors) {
			$response['errors'] = $errors;
		}

		$hasData = !empty($response['data']);

		if ($this->api->valid()) {
			if ($method == "POST") {
				if ($hasData) {
					$this->status(201); // created new resource
				} else {
					if($this->api->valid()){
						$this->status(404); // empty GET result
					}
				}
			}else if($method == "PUT"){
				if($hasData){
					$this->status(200); // updated resource
				}else{
					if($this->api->valid()){
						$this->status(500); // empty GET result
					}
				}
			}else if ($method == "GET") {
				if (!$hasData) {
					$this->status(404);
				}
			}else if($method == "DELETE"){
				// ONLY 200 or SOMETHING CUSTOM
				if(!$hasData){
					if($this->api->valid()){
						$this->status(500); // you must send Boolean response
					}
				}
			}
		}

		// SEND RESPONSE
		if (!$this->api->valid()) {
			$response["data"] = array();
		} else {
			if (isset($response["data"])) {
				$data = $this->prepareResponseData($response["data"], 'data');
				if (is_null($data)) {
					$response["data"] = array();
				} else {
					$response["data"] = $data;
				}
			} else {
				$response["data"] = array();
			}

		}

		// SEND RESPONSE
		if (!empty($response["meta"])) {
			$response["meta"] = $this->prepareResponseData($response["meta"], 'meta');
		}

		if ($this->_type == self::RESPONSE_TYPE_MANY) {
			$response["meta"]['count'] = count($response["data"]);
			$response["meta"]['limit'] = $this->_limit;
			$response["meta"]['offset'] = $this->_offset;
		}
		$response['meta']['fields'] = $this->_fields;

		$response['success'] = $this->status() < 400;

		// DEBUG DATA (only for development and testing mode)
		if (Api::DEBUG_MODE) {
			$response["debug"] = array(
				'uri' => $this->api->getLaunchParam('uri'),
				'method' => $method,
				'time' => (round((gettimeofday(true) - $this->api->getLaunchParam('debug/start_timestamp')) * 100000) / 100000),
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
					'server' => array (
						'ip' => $this->api->server->ip,
						'host' => $this->api->server->host,
						'hostname' => $this->api->server->hostname,
						'port' => $this->api->server->port,
						'path' => $this->api->server->path,
						'pathname' => $this->api->server->pathname,
						'search' => $this->api->server->search,
						'scheme' => $this->api->server->scheme,
						'protocol' => $this->api->server->protocol,
					),
					"url"    => $this->api->input->url(),
					"query"  => $this->api->input->query(),
					"body"   => $this->api->input->body(),
					"body:raw" => INPUT_DATA
				),
				"api" => $this->api->get()
			);
		}

		$http_code = $this->status();

		$response['status'] = $http_code;

		$public_http_code = $this->_virtualStatus && $http_code >= 400 ? self::VIRTUAL_STATUS : $this->status();

		$this->setHeader('Content-Type', $this->api->server->outputMime);

		$this->_compiled = array(
			'response' => $response,
			'status' => $public_http_code,
			'headers' => $this->getHeaders()
		);

		return $this->_compiled;
	}


	private $_headers = array();

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

    public function send ($compress = false) {

		$_response = $this->compile();
		$response = $_response['response'];

		$headers = $_response['headers'];
		$status = $_response['status'];

        header('HTTP/1.1: '.$status);
        header('Status: '.$status);
		foreach($headers as $headerName => $headerValue) {
			header($headerName.': '.$headerValue);
		}

		$response = (string) $this->api->format->applyFormat($response, $this->api->server->outputFormat);

		if ($compress) {
			$zlibOc = @ini_get('zlib.output_compression');
			$compressing = self::COMPRESSING && !$zlibOc && extension_loaded('zlib') && ApiUtils::get($this->api->server->encoding, 'gzip', false);


			if (!$zlibOc && !$compressing) {
				header('Content-Length: ' . strlen($response));
			} else if ($compressing) {
				ob_start('ob_gzhandler');
			}
		} else {
			header('Content-Length: ' . strlen($response));
		}

        exit($response);
    }

    function status($code = null){
        if(!is_null($code)){
            if(!is_numeric($code)){
                trigger_error('Status code "'.$code.'" must be numeric type!', E_USER_ERROR);
            }
            $this->_status = $code;
        }
        return empty($this->_status) ? ApiOutput::DEFAULT_STATUS : $this->_status;
    }

    function data($name = null, $value = null){
        if(!is_null($name)){
            if(is_object($name)){
                $name = (array) $name;
            }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
                $arr = array();
                $arr[$name] = $value;
                $name = $arr;
            }
            if(is_array($name)){
                foreach($name as $n => $v){
                    $this->_data[$n] = $v;
                }
            } else {
                trigger_error("invalid meta format", E_USER_WARNING);
            }
        }
        return $this->_data;
    }

    function meta($name = null, $value = null){
        if(!is_null($name)){
            if(is_object($name)){
                $name = (array) $name;
            }else if(!is_array($name) && (is_string($name) || is_numeric($name))){
                $arr = array();
                $arr[$name] = $value;
                $name = $arr;
            }
            if(is_array($name)){
                foreach($name as $n => $v){
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
            $_data[$name] = $this->api->format->toType($data[$name], $param["type"]);
        } else if ($strict) {
            trigger_error("Api '".$this->api->get('name')."': invalid response. '".$name."' is undefined!");
        }
    }

    function prepareResponseData ($data, $keyName = 'data') {
        $_data = array();

        if($this->_type == ApiOutput::RESPONSE_TYPE_ONE){
            if (isset($data[0]) && is_array($data[0])) {
                $data = $data[0];
            }
            if (empty($data)) {
                return null;
            } else {
                if (!empty($this->_responseOutput[$keyName])) {
                    foreach ($this->_responseOutput[$keyName] as $param) {
                        $this->_prepareData($_data, $data, $param, true);
                    }
                }
            }
        } else if ($this->_type == ApiOutput::RESPONSE_TYPE_MANY) {
            if (!empty($data) && (!isset($data[0]) || !is_array($data[0]))) {
                $data = array($data);
            }
            if (!empty($this->_responseOutput[$keyName])) {
                foreach ($data as $k => $_d) {
                    $_data[$k] = array();
                    foreach ($this->_responseOutput[$keyName] as $param) {
                        $this->_prepareData($_data[$k], $_d, $param, true);
                    }
                }
            }
			if ($this->_limit) {
				$_data = array_slice($_data, 0, $this->_limit);
			}
        }

        return $_data;
    }

}