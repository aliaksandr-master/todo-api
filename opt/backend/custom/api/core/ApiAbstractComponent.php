<?php



abstract class ApiAbstractComponent extends ApiAbstract {


	public function __construct (Api &$api) {
		$this->api = $api;
	}

	protected function getSpec ($name, $default) {
		return $this->api->getSpec($name, $default);
	}

}