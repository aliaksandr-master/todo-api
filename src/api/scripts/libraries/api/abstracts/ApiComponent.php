<?php



class ApiComponent extends ApiAbstract {


	public function __construct (Api &$api) {
		$this->api = $api;
	}


	public function beforeLaunch () {
	}


	public function beforeActionCall () {
	}
}