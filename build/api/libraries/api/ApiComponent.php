<?php



class ApiComponent extends ApiAbstract {


	public function __construct (Api &$api) {
		$this->api = $api;
	}

	function beforeActionCall () {
	}
}