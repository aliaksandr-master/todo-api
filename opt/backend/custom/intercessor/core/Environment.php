<?php


namespace Intercessor;

class Environment extends EventBroker {

	/** @var string */
	public $virtual_failure_query_param = 'virtual_failure';

	/** @var string */
	public $limit_query_param = 'limit';

	/** @var string */
	public $offset_query_param = 'offset';

	/** @var array */
	public $_additionalQueryParams = array(
		array( 'name' => 'virtual_failure', 'type' => 'boolean' ),
		array( 'name' => 'limit', 'type' => 'decimal' ),
		array( 'name' => 'offset', 'type' => 'decimal' )
	);

	public $default_controller = 'BaseResourceController';

	/** @var array */
	public $mimes = array();

	/** @var array */
	public $statuses = array();

	/** @var bool */
	public $debug = false;

	/** @var bool */
	public $error_handler = true;

	public $default_request_format = 'json';
	public $default_response_format = 'json';
	public $default_response_status = '200';
	public $virtual_failure_response_status = '200';

	public $optional_response_keys = array( 'errors', 'debug', 'meta', 'data' );

	function request ($name, $method, $url) {
		Debugger::init($this->debug);
		$request  = new Request($name, $method, $url);
		$response = new Response();
		$request->_init($this, $request, $response);
		$response->_init($this, $request, $response);
		return $request;
	}
}